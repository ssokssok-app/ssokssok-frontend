import qrImage from '@/assets/images/qr-ssokssok.svg'
import SsokssokLogo from '@/assets/logos/ssokssok.svg?react'

/**
 * 데스크톱 화면에서 앱 기둥 오른쪽에 두는 소개 (Figma Slide 16:9 - 1, 156:5490).
 * 화면 높이 가운데에 붙어 있고, 앱 화면을 스크롤해도 따라 움직이지 않는다. 좁은 화면에서는 그리지 않는다.
 * 가로 위치는 기둥과 같은 계산(--app-column-left)에 기둥 폭 · 간격을 더한다 (src/index.css "데스크톱 화면").
 */
export function DesktopIntro() {
  return (
    <aside
      aria-label="쏙쏙 소개"
      className="fixed inset-y-0 left-[calc(var(--app-column-left)+var(--container-app)+var(--desktop-gap))] hidden w-(--desktop-intro-width) flex-col justify-center gap-14 desktop:flex"
    >
      <div className="flex flex-col gap-[18px]">
        <SsokssokLogo
          role="img"
          aria-label="쏙쏙"
          className="h-[101px] w-[174px] text-blue-500"
        />
        {/*
         * Figma 는 글자 스타일 없이 28px Bold 로 그려서, 같은 크기의 Headline/L/Semibold 를 쓴다 (docs/product.md).
         * 문장마다 줄을 나누고, 큰글씨 모드에서 한 문장이 넘치면 줄 길이를 고르게 나눠 한 단어만 떨어지지 않게 한다
         */}
        <p className="flex flex-col text-headline-l-semibold text-blue-500">
          <span className="text-balance">
            어려운 공공 안내문과 생활 문서를 쉬운 글로 바꾸고,
          </span>
          <span className="text-balance">
            중요한 정보와 해야 할 일을 정리해주는 AI 서비스, 쏙쏙
          </span>
        </p>
      </div>
      {/* Figma QR 은 임시 이미지라, 실서비스 주소(https://www.ssokssok.site)로 만든 QR 을 쓴다. 카드는 큰글씨 설명을 따라 넓어진다 */}
      <figure className="flex w-fit min-w-[220px] flex-col items-center gap-2.5 rounded-[20px] bg-white px-[21px] py-[23px]">
        <img
          src={qrImage}
          alt="휴대폰 카메라로 찍으면 쏙쏙 주소가 열리는 QR 코드"
          className="size-[168px]"
        />
        <figcaption className="text-body-semibold whitespace-nowrap text-gray-700">
          모바일로도 체험할 수 있어요
        </figcaption>
      </figure>
    </aside>
  )
}
