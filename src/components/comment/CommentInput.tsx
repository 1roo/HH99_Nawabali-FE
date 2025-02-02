import { useState } from 'react';
import styled from 'styled-components';
import { addComment } from '@/api/comment';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AlertModal from '../modal/AlertModal';

const CommentInput = ({ postId }: { postId: number }) => {
  const [newComment, setNewComment] = useState('');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<React.ReactNode>('');
  const [alertType, setAlertType] = useState('');
  const queryClient = useQueryClient();

  const showAlertModal = (message: React.ReactNode) => {
    setAlertMessage(message);
    setIsAlertModalOpen(true);
  };

  // 댓글 생성
  const createCommentMutation = useMutation({
    mutationFn: () => addComment(postId, newComment),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['scrollComments'] });
      queryClient.invalidateQueries({ queryKey: ['scrollPosts'] });
      setAlertType('complete');
      showAlertModal('댓글 작성 완료!');
      setNewComment('');
    },
    onError: (error: any) => {
      if (error.response.status === 403) {
        setAlertType('error');
        showAlertModal([
          '앗, 댓글작성은',
          <br />,
          '로그인 후 이용 가능합니다 :)',
        ]);
      }
    },
  });

  const handleKeyDown = async (event: any) => {
    if (event.key === 'Enter' && newComment.trim()) {
      if (event.nativeEvent.isComposing) return;
      createCommentMutation.mutate();
    }
  };

  return (
    <>
      <MyCommentBox>
        <MyProfile
          src={
            localStorage.getItem('profileImageUrl')?.split('"')[1] ??
            '/assets/images/DefaultProfile.png'
          }
          // src={
          //   localStorage.getItem('profileImageUrl') ??
          //   'public/assets/images/DefaultProfile.png'
          // }
          alt=""
        />

        <MyCommentInput
          placeholder="댓글 달기"
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={100}
        ></MyCommentInput>
      </MyCommentBox>
      {isAlertModalOpen && (
        <AlertModal
          message={alertMessage}
          closeAlert={() => setIsAlertModalOpen(false)}
          alertType={alertType}
        />
      )}
    </>
  );
};

const MyCommentBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
`;

const MyProfile = styled.img`
  width: 50px;
  height: 50px;
  background-color: #f1f1f1;
  margin: 0px 10px;
  border: none;
  border-radius: 100px;
  object-fit: cover;
`;

const MyCommentInput = styled.input`
  width: 280px;
  height: 20px;
  padding: 12px 20px;
  border: 1px solid #d9d9d9;
  border-radius: 60px;
`;

export default CommentInput;
