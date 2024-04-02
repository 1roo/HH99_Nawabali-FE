/* eslint-disable @typescript-eslint/no-explicit-any */
import useDidMountEffect from '@/utils/regex/customHooks/useDidMountEffect';
import { useState, useEffect } from 'react';
import styled from 'styled-components';

declare global {
  interface Window {
    kakao: any;
  }
}

interface KaKaoMapProps {
  width: string;
  height: string;
}

const KaKaoMap = ({ width, height }: KaKaoMapProps) => {
  const [map, setMap] = useState<any>();
  const [marker, setMarker] = useState<any>();
  const [pointAddr, setPointAddr] = useState<string>('');

  // 1. 카카오맵 불러오기
  useEffect(() => {
    window.kakao.maps.load(() => {
      const container = document.getElementById('map');
      const options = {
        center: new window.kakao.maps.LatLng(37.514575, 127.0495556),
        level: 3,
      };

      setMap(new window.kakao.maps.Map(container, options));
      setMarker(new window.kakao.maps.Marker());
    });
  }, []);

  // 2. 현재 위치 함수
  const getCurrentPosBtn = () => {
    navigator.geolocation.getCurrentPosition(
      getPosSuccess,
      () => alert('위치 정보 가져오기 실패'),
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000,
      },
    );
  };

  // 3. 현재 위치 함수가 정상 작동하면 실행
  const getPosSuccess = (pos: GeolocationPosition) => {
    // 현재 위치의 위도, 경도
    const currentPos = new window.kakao.maps.LatLng(
      pos.coords.latitude, // 위도
      pos.coords.longitude, // 경도
    );

    // 지도를 현재 위치로 이동시킨다.
    map.panTo(currentPos);

    // 기존 마커를 제거하고 새로운 마커를 넣는다.
    marker.setMap(null);
    marker.setPosition(currentPos);
    marker.setMap(map);
  };

  // 4. 지도에 찍는 곳으로 마커 변경
  useDidMountEffect(() => {
    window.kakao.maps.event.addListener(
      map,
      'click',
      function (mouseEvent: any) {
        let geocoder = new window.kakao.maps.services.Geocoder();

        geocoder.coord2Address(
          mouseEvent.latLng.getLng(),
          mouseEvent.latLng.getLat(),
          (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const newPointAddr = result[0].road_address
                ? result[0].road_address.address_name
                : result[0].address.address_name;

              setPointAddr(newPointAddr);

              marker.setMap(null);
              marker.setPosition(mouseEvent.latLng);
              marker.setMap(map);
            }
          },
        );
      },
    );
  }, [map]);

  // 5. 검색된 주소 위치 표시
  const onClickAddr = () => {
    new window.daum.Postcode({
      oncomplete: function (addrData: any) {
        let geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(
          addrData.address,
          function (result: any, status: any) {
            if (status === window.kakao.maps.services.Status.OK) {
              let currentPos = new window.kakao.maps.LatLng(
                result[0].y,
                result[0].x,
              );
              (document.getElementById('addr') as HTMLInputElement).value =
                addrData.address;
              map.panTo(currentPos);
              marker.setMap(null);
              marker.setPosition(currentPos);
              marker.setMap(map);
            }
          },
        );
      },
    }).open();
  };

  return (
    <>
      <div onClick={onClickAddr}>
        <AddressInput
          type="text"
          id="addr"
          value={pointAddr}
          placeholder="주소를 검색하세요"
          readOnly
        />
      </div>
      <MapBox id="map" style={{ width, height }}></MapBox>
      <MyLocationBtn onClick={getCurrentPosBtn}>현 위치</MyLocationBtn>
    </>
  );
};

const MapBox = styled.div`
  border-radius: 20px;
`;

const MyLocationBtn = styled.div`
  width: 55px;
  margin: 10px;
  padding: 10px;
  border: 1px solid #c2c2c2;
  border-radius: 15px;
  cursor: pointer;
`;

const AddressInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  margin: 10px 0px 10px 0px;
  padding: 12px 16px;
  background-color: #f1f1f1;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
`;

export default KaKaoMap;
