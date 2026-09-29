const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const { promptApiKey } = require('./promptInput');

const TMS_API_BASE_URL = 'http://tms-internal.zoomex.com/api';

/**
 * Unlock the Weblate component
 * @param tmsApiKey
 * @param appName
 */
async function unlockTmsComponent(tmsApiKey, appName) {
    console.info('Unlock the Weblate component');
    const tmsLockApiUrl = `${TMS_API_BASE_URL}/components/official_website/${appName}/lock/`;
    await axios
        .post(
            tmsLockApiUrl, { lock: false }, { headers: { Authorization: `Token ${tmsApiKey}` } }
        )
        .then((res) => console.log('Successfully unlocked ', res.data))
        .catch((err) => console.log('Fail to unlock before creating keys ', err));
}

/**
 * Create key into TMS 1 by 1
 * @param translationObj
 * @param tmsApiKey
 * @param appName
 */
async function create1By1(translationObj, tmsApiKey, appName) {
    const tmsUnitApiUrl = `${TMS_API_BASE_URL}/translations/official_website/${appName}/en-US/units/`;
    // Create 1 by 1
    console.time('Create key 1 by 1');

    const objKeys = Object.keys(translationObj);
    const objValues = Object.values(translationObj);

    let count = 0;
    let successCount = 0;
    let failureCount = 0;

    while (count < objKeys.length) {
        console.log('This is for loop ', count);
        await axios
            .post(
                tmsUnitApiUrl, { key: objKeys[count], value: [objValues[count]] }, { headers: { Authorization: `Token ${tmsApiKey}` } }
            )
            .then(async(result) => {
                console.log(
                    'Successfully created key => ',
                    objKeys[count],
                    result.status
                );
                successCount++;
                count++;
            })
            .catch(async(err) => {
                console.log(
                    'Fail to create key => ',
                    objKeys[count],
                    err.response && err.response.data,
                    err.response && err.response.status
                );
                if (err.response && err.response.status === 403) {
                    // 403: Weblate component is locked, unlock and retry
                    await unlockTmsComponent(tmsApiKey, appName);
                } else if (err.response && err.response.status === 400) {
                    // 400： the key is already existing, consider successful
                    successCount++;
                    count++;
                } else {
                    failureCount++;
                    count++;
                }
            });
    }
    console.timeEnd('Create key 1 by 1');

    console.log(
        `Expected: ${
      Object.keys(translationObj).length
    }; Success: ${successCount}; Failed: ${failureCount}`
    );
}

/**
 * Create key into TMS batch by batch
 * @param translationObj
 * @param tmsApiKey
 * @param appName
 */
async function createByBatch(translationObj, tmsApiKey, appName) {
    const tmsFileApiUrl = `${TMS_API_BASE_URL}/translations/official_website/${appName}/en-US/file/`;

    console.info('Export the file before creating key in TMS');
    const fileName = 'translationObj.json';
    const exportedFilePath = path.join(__dirname, fileName);
    fs.writeFileSync(exportedFilePath, JSON.stringify(translationObj));

    console.info('Start to create key in TMS, please be patient... ');

    const formData = new FormData();
    formData.append('file', fs.createReadStream(exportedFilePath));
    formData.append('method', 'add');

    await axios
        .post(tmsFileApiUrl, formData, {
            headers: {
                Authorization: `Token ${tmsApiKey}`,
                ...formData.getHeaders(),
            },
        })
        .then((res) => {
            console.log('Successfully created keys with file ', res.data);
            fs.unlinkSync(exportedFilePath);
        })
        .catch((err) => {
            console.error(
                'Fail to create key => ',
                err.response && err.response.data
            );
            throw new Error('Fail to create key in batch');
        });
}

/**
 * Get the existing keys in TMS
 * @param appName
 * @param queryParam
 */
async function getTmsKey(appName, queryParam = '') {
    const tmsUnitApiUrl = `${TMS_API_BASE_URL}/translations/official_website/${appName}/en-US/units/${queryParam}`;
    const getExistingKey = await axios.get(tmsUnitApiUrl);
    return getExistingKey && getExistingKey.data;
}

/**
 * Split keys into few batches before creation
 * @param appName
 * @param tmsApiKey
 * @param translationObj
 */
async function splitKeysIntoBatch(appName, tmsApiKey, translationObj) {
    // Create batch by batch (500 keys per batch) bcoz create more than 1000 keys will be rejected
    const objValues = Object.values(translationObj) || [];
    const objKeys = Object.keys(translationObj) || [];
    const keyNumPerBatch = 500;
    const batchTotal = Math.ceil(objValues.length / keyNumPerBatch);
    console.info(`Gonna create TMS keys in ${batchTotal} batch(es)`);

    console.time('Create key batch by batch');
    let batchCount = 0;
    while (batchCount < batchTotal) {
        console.info(`This is batch ${batchCount + 1}`);
        let batchObj = {};
        const startNum = batchCount * keyNumPerBatch;
        const endNum = (batchCount + 1) * keyNumPerBatch;

        // create a new object to contain the keys to be created in this batch
        for (let k = startNum; k < endNum && k < objValues.length; k++) {
            batchObj[objKeys[k]] = objValues[k];
        }

        await createByBatch(batchObj, tmsApiKey, appName)
            .then(() => {
                console.log('Successfully created key for batch ', batchCount + 1);
                batchCount++;
            })
            .catch(async(e) => {
                console.log('Fail to create key for batch ', batchCount + 1, e);
                await unlockTmsComponent(tmsApiKey, appName);
            });
    }
    console.timeEnd('Create key batch by batch');
}

/**
 * Deduplicate all existing keys from object
 * @param appName
 * @param translationObj
 * @param keyCount
 */
// async function deduplicateKeys(translationObj, appName, keyCount) {
//   const processedObj = {...translationObj};
//   const apiCount = Math.ceil(keyCount / 20);
//   let currentCount = 0;
//   while(currentCount < apiCount) {
//     const existingKeyRes = await getTmsKey(appName, `?page=${currentCount + 1}`);
//     const existingKeys = existingKeyRes.results && existingKeyRes.results.map(el => el.context) || [];
//     existingKeys.forEach(key => {
//       delete processedObj[key];
//     })
//     currentCount++;
//   }
//   return processedObj;
// }

/**
 * Create key in TMS using API
 * Note: we are only able to set en-US translation
 * @param translationObj
 * @param appName
 */
module.exports = async function createKeysInTms(translationObj, appName) {
    // prompt user for Weblate API key
    const tmsApiKey = promptApiKey();

    try {
        const existingKeyRes = await getTmsKey(appName);
        const keyCount = existingKeyRes.count;

        console.info('Existing keys in TMS => ', keyCount);

        console.info(
            `Expect to create total ${Object.keys(translationObj).length} keys`
        );

        if (keyCount) {
            // Create 1 by 1
            await create1By1(translationObj, tmsApiKey, appName);

            // potential optimization: create keys in batch after deduplication
            // issue: call the getTmsKey too frequently - will get status 429 (Request was throttled)
            // await deduplicateKeys(translationObj, appName, keyCount);
            // await splitKeysIntoBatch(appName, tmsApiKey, processedObj);
        } else {
            await splitKeysIntoBatch(appName, tmsApiKey, translationObj);
        }
    } catch (e) {
        console.error('Fail to create keys in TMS ', e);
    }
};