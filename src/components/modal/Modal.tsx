import styled, { css } from 'styled-components';

interface ModalChildrenType {
  children?: React.ReactNode;
  size?: 'regular' | 'auth';
}

const Modal: React.FC<ModalChildrenType> = ({ children, size = 'regular' }) => {
  return (
    <ModalWrapper>
      <ModalContent size={size}>{children}</ModalContent>
    </ModalWrapper>
  );
};

const ModalWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(82, 82, 82, 0.6);
`;

const ModalContent = styled.div<{ size?: 'regular' | 'auth' }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  border-radius: 15px;
  background-color: white;

  ${(props) =>
    props.size === 'regular' &&
    css`
      padding: 20px;
    `}

  ${(props) =>
    props.size === 'auth' &&
    css`
      padding: 100px;
      box-sizing: border-box;
      width: 600px;
      height: 800px;
    `}
`;

export default Modal;
