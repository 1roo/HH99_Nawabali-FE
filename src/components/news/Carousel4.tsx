import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import * as s from './CasouselStyle';
import styled from 'styled-components';
import {
  IoArrowBackCircleOutline,
  IoArrowForwardCircleOutline,
} from 'react-icons/io5';
import {
  useGetAllPostsByDistrictOrCategory,
  useGetCategoryCountsByDistrict,
} from '@/api/news';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CategoryData, PostItem } from '@/interfaces/main/news.interface';
import { useNavigate } from 'react-router-dom';

function useFetchPosts(district: string) {
  const queryParams = {
    district: district,
  };

  const { data } = useGetCategoryCountsByDistrict(queryParams.district);
  return { data };
}

const getRandomSVGName = () => {
  const svgNames = ['FOOD', 'CAFE', 'PHOTOZONE'];
  const randomIndex = Math.floor(Math.random() * svgNames.length);
  return svgNames[randomIndex];
};
const iconCategory = getRandomSVGName();

function useFetchCarouslPosts(district: string, category: string) {
  const queryParams = {
    district: district,
    category: category,
  };

  const { data } = useGetAllPostsByDistrictOrCategory(
    queryParams.district,
    queryParams.category,
    9,
  );
  return { data };
}

function Carousel4() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [maxCategory, setMaxCategory] = useState<string>('');
  const [maxCategoryKorean, setMaxCategoryKorean] = useState<string>('');
  const district = localStorage.getItem('district')!;
  const { data: categoryCounts } = useFetchPosts(district);
  const { data: carouselPosts } = useFetchCarouslPosts(district, maxCategory);
  const slickRef = useRef<Slider | null>(null);
  const navigate = useNavigate();

  const totalSlides = 7;
  const actualSlides = carouselPosts?.content.length || 0;
  const emptySlidesCount = Math.max(0, totalSlides - actualSlides);

  const previous = useCallback(() => {
    if (slickRef.current) {
      slickRef.current.slickPrev();
    }
  }, []);

  const next = useCallback(() => {
    if (slickRef.current) {
      slickRef.current.slickNext();
    }
  }, []);

  let settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2000,
    slidesToShow: 3,
    slidesToScroll: 3,
    arrows: false,
    initialSlide: 0,
    beforeChange: (newIndex: number) => {
      setCurrentSlide(newIndex);
    },
  };

  const goToPosts = () => {
    navigate(
      `/listpage?district=${encodeURIComponent(district)}&category=${encodeURIComponent(maxCategory)}`,
    );
  };

  const findMaxPostCategory = (
    categoryCounts: CategoryData[] | undefined,
  ): string => {
    if (!categoryCounts || categoryCounts.length === 0)
      return 'No data available';

    let maxCategory = categoryCounts[0];
    categoryCounts.forEach((item) => {
      if (item.postCount > maxCategory.postCount) {
        maxCategory = item;
      }
    });
    return maxCategory.category;
  };

  useEffect(() => {
    if (categoryCounts && categoryCounts.length > 0) {
      setCategoryData(categoryCounts);
      const maxCat = findMaxPostCategory(categoryCounts);
      setMaxCategory(maxCat);
      if (maxCat === 'FOOD') {
        setMaxCategoryKorean('맛집이');
      } else if (maxCat === 'CAFE') {
        setMaxCategoryKorean('카페가');
      } else {
        setMaxCategoryKorean('사진스팟이');
      }
    }
  }, [categoryCounts]);

  return (
    <div style={{ height: '300px', backgroundColor: '#FAFAFA' }}>
      <s.Container>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <s.Col>
            <div>
              <span style={{ fontSize: '9px' }}>우리동네 대표 카테고리</span>
              <s.Col>
                <s.TitleSpan>
                  {district}는 {maxCategoryKorean}
                </s.TitleSpan>
                <s.TitleSpan>활성화 된 동네예요!</s.TitleSpan>
              </s.Col>
            </div>
            <s.Col style={{ margin: '5px 0' }}>
              <TextSpan>한 달간 작성된 게시물을 분석한 결과</TextSpan>
              <span
                style={{
                  fontSize: '9px',
                  color: '#707070',
                  fontWeight: '500',
                  margin: '1px 0',
                }}
              >
                {categoryData.map((cat, index) => (
                  <span
                    key={cat.category}
                    style={{
                      fontSize: '9px',
                      fontWeight: '500',
                    }}
                  >
                    {cat.category === 'FOOD'
                      ? '맛집'
                      : cat.category === 'CAFE'
                        ? '카페'
                        : '사진스팟'}{' '}
                    {cat.postCount}개
                    {index < categoryData.length - 1 ? ' |' : '의 '}
                  </span>
                ))}
              </span>
              <TextSpan>게시물이 올라왔어요!</TextSpan>
            </s.Col>
            <span
              style={{
                fontSize: '9px',
                fontWeight: '600',
                color: '#707070',
                textDecoration: 'underLine',
              }}
              onClick={goToPosts}
            >
              게시물 보러가기
            </span>
            <BarContainer>
              <Progress $index={currentSlide + 1} />
            </BarContainer>
            <Arrows>
              <IoArrowBackCircleOutline onClick={previous} />
              <IoArrowForwardCircleOutline onClick={next} />
            </Arrows>
          </s.Col>
          <StyledSlider ref={slickRef} {...settings}>
            {carouselPosts?.content.map((item: PostItem, idx: number) => (
              <ImageContainer key={idx}>
                <Post $backgroundImage={item.mainImageUrl} />
              </ImageContainer>
            ))}
            {[...Array(emptySlidesCount)].map((_, idx) => (
              <ImageContainer key={`empty-${idx}`}>
                <EmptyPost>
                  <img src={`/assets/svgs/noPost${iconCategory}.svg`} />
                </EmptyPost>
              </ImageContainer>
            ))}
          </StyledSlider>
        </div>
      </s.Container>
    </div>
  );
}

export default Carousel4;

const ImageContainer = styled.div<{ isCenter?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: ${(props) => (props.isCenter ? '0 0px' : '0')};

  p {
    text-decoration: none;
    text-align: left;
    margin: 0;
  }
`;

const EmptyPost = styled.div`
  width: 170px;
  height: 238px;
  border: 1px solid #e2e2e2;
  background-color: #e1e1e1;
  display: flex;
  border-radius: 20px;
  align-items: center;
  justify-content: center;

  img {
    width: 150px;
  }
`;

const StyledSlider = styled(Slider)`
  margin: 0 0 0 30px;
  padding-top: 30px;
  width: 530px;
  .slick-prev::before,
  .slick-next::before {
    opacity: 0;
    display: none;
  }
`;

export const Post = styled.div<{
  $backgroundImage: string;
}>`
  background-image: url(${(props) => props.$backgroundImage});
  background-size: cover;
  background-position: center;
  width: 170px;
  height: 238px;
  display: block;
  border-radius: 20px;
`;

const Arrows = styled.div`
  svg {
    width: 1.5rem;
    height: 1.5rem;
    color: grey;
    cursor: pointer;
  }
`;

const TextSpan = styled.span`
  font-size: 9px;
  color: #707070;
`;

const Progress = styled.div<{ $index: number }>`
  width: ${(props) => 15 * props.$index}px;
  height: 1px;
  background-color: black;
  border-radius: 3px;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.5s ease-in-out;
`;

const BarContainer = styled.div`
  width: 105px;
  height: 1px;
  background-color: #bebebe;
  border-radius: 3px;
  position: relative;
  margin: 15px 0;
`;
