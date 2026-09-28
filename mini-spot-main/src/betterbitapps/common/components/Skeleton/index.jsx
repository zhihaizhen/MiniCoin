/* eslint-disable jsx-a11y/heading-has-content */
import React from 'react';
import './skeleton.less';

function Skeleton() {
  return (
    <div className="common-skeleton">
      <div className="common-skeleton-content">
        <h3 className="common-skeleton-title" style={{ width: '38%' }} />
        <ul className="common-skeleton-paragraph">
          <li />
          <li />
          <li style={{ width: '61%' }} />
        </ul>
      </div>
    </div>
  );
}

export default Skeleton;
