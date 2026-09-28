import NextImage from 'next/legacy/image';
import { ImageProps } from 'next/legacy/image';

const myLoader = ({ src }) => {
  return src;
};

export const Image = (props: ImageProps) => {
  return <NextImage loader={myLoader} {...props} />;
};
