import { instance, authInstance } from '../axios';

export const getPosts = async ({ pageParam }: { pageParam: number }) => {
  let params = {
    page: String(pageParam),
    size: '10',
    sort: ['string'],
  };

  let pageable = new URLSearchParams();
  pageable.append('page', params.page);
  pageable.append('size', params.size);
  params.sort.forEach((s) => pageable.append('sort', s));

  const response = await instance.get(`/posts?${pageable.toString()}`);
  console.log('포스트들 가져오기 getPosts api');
  console.log(response);
  return response;
};

export const getAllPosts = async ({ pageParam }: { pageParam: number }) => {
  let params = {
    page: String(pageParam),
    size: '100',
    sort: ['string'],
  };

  let pageable = new URLSearchParams();
  pageable.append('page', params.page);
  pageable.append('size', params.size);
  params.sort.forEach((s) => pageable.append('sort', s));

  const response = await instance.get(`/posts?${pageable.toString()}`);
  console.log('포스트들 가져오기 getAllPosts api');
  console.log(response);
  return response;
};

export const createPost = async (newPost: FormData) => {
  console.log('새로운 포스트 생성 createPost api');
  await authInstance.post('/posts', newPost);
};
