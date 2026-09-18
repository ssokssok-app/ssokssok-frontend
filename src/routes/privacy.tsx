import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

import ArrowBackIosIcon from '@/assets/icons/24/arrow-back-ios.svg?react'
import { Gnb, GnbIconButton } from '@/components/gnb'
import { CONTACT_EMAIL } from '@/lib/contact'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

/**
 * 개인정보처리방침 (Figma 에 없는 화면, docs/product.md "확인 필요").
 *
 * 개인정보보호법 제30조가 수립 · 공개를 요구한다. 이용자가 올리는 문서에 성명 · 주소 · 주민등록번호 ·
 * 계좌번호가 들어 있어, 로그인 여부와 상관없이 필요하다.
 *
 * 주 사용자가 글을 읽기 어려운 사람이라, 법정 조항 위에 쉬운 말 요약을 먼저 둔다. 조항 자체는
 * 법적 문서라 표준 항목 · 표현을 그대로 쓴다.
 */
function PrivacyPage() {
  const router = useRouter()
  const navigate = Route.useNavigate()
  const canGoBack = useCanGoBack()

  function goBack() {
    // 주소로 바로 들어왔으면 돌아갈 곳이 없어 설정으로 간다
    if (canGoBack) router.history.back()
    else navigate({ to: '/settings' })
  }

  return (
    <div className="min-h-dvh bg-white pt-[env(safe-area-inset-top)] pb-[max(3rem,calc(env(safe-area-inset-bottom)+1.5rem))]">
      <Gnb
        tone="dark"
        title="개인정보처리방침"
        left={
          <GnbIconButton
            label="뒤로 가기"
            icon={ArrowBackIosIcon}
            onClick={goBack}
          />
        }
      />

      <main className="flex flex-col gap-8 px-5 pt-6">
        {/* 조항을 다 읽지 못하는 사용자를 위해 핵심만 먼저 쉬운 말로 적는다 */}
        <section
          aria-label="쉬운 요약"
          className="flex flex-col gap-3 rounded-[12px] bg-blue-90 px-4 py-5"
        >
          <h2 className="text-subtitle-semibold text-blue-500">
            쉽게 말하면 이래요
          </h2>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-body-regular text-gray-700 marker:text-blue-400">
            <li>올린 문서는 쉬운 글로 바꾸는 데만 쓰고, 끝나면 지워요.</li>
            <li>쏙쏙은 이름이나 연락처를 따로 받지 않아요.</li>
            <li>
              하루 이용 횟수를 세려고 기기 번호 하나만 저장해요. 누구인지는 알
              수 없는 번호예요.
            </li>
            <li>궁금한 점은 {CONTACT_EMAIL} 으로 물어보세요.</li>
          </ul>
        </section>

        <p className="text-caption-l-regular text-gray-500">
          시행일: {EFFECTIVE_DATE}
        </p>

        <Article title="1. 수집하는 개인정보 항목">
          <p>
            쏙쏙은 회원가입을 받지 않으며, 이름 · 연락처 · 생년월일 등을 직접
            입력받지 않습니다. 서비스 이용 과정에서 아래 정보가 처리됩니다.
          </p>
          <List>
            <li>
              <Term>이용자가 올린 문서</Term> 사진(JPG · PNG) 또는 PDF 파일.
              문서 안에 성명 · 주소 · 주민등록번호 · 계좌번호 · 급여 등 민감한
              정보가 포함될 수 있습니다.
            </li>
            <li>
              <Term>기기 식별값</Term> 이용자의 브라우저에서 자동으로 만든
              임의의 번호(UUID). 이름 · 연락처 등 개인을 알아볼 수 있는 정보는
              들어 있지 않으며, 하루 이용 횟수를 세는 데만 씁니다.
            </li>
            <li>
              <Term>문의 내용</Term> 이용자가 전자우편으로 보낸 내용과 발신
              주소.
            </li>
          </List>
        </Article>

        <Article title="2. 개인정보의 처리 목적">
          <List>
            <li>문서를 쉬운 글과 요약 정보로 바꾸어 보여 주기</li>
            <li>하루 이용 횟수 제한 및 부정 이용 방지</li>
            <li>문의 접수 및 처리 결과 회신</li>
          </List>
          <p>처리 목적이 바뀌는 경우에는 미리 알리고 동의를 받습니다.</p>
        </Article>

        <Article title="3. 개인정보의 보유 및 이용 기간">
          <List>
            <li>
              <Term>문서 파일 · 변환 결과</Term> 변환이 끝난 뒤 30분 이내에
              자동으로 삭제합니다(TTL). 별도로 저장하거나 학습에 쓰지 않습니다.
            </li>
            <li>
              <Term>기기 식별값 · 이용 횟수 기록</Term> {DEVICE_ID_RETENTION}
            </li>
            <li>
              <Term>문의 내용</Term> {INQUIRY_RETENTION}
            </li>
          </List>
        </Article>

        <Article title="4. 개인정보의 제3자 제공">
          <p>
            쏙쏙은 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에
            따라 수사기관 등이 적법한 절차로 요구하는 경우는 예외로 합니다.
          </p>
        </Article>

        <Article title="5. 개인정보 처리업무의 위탁">
          <p>
            서비스 제공을 위해 아래 업무를 외부에 위탁하고 있습니다. 위탁계약 시
            개인정보가 안전하게 관리되도록 필요한 사항을 정하고 있습니다.
          </p>
          <List>
            <li>
              <Term>문자 인식(OCR) · 쉬운 글 변환</Term> 네이버클라우드
            </li>
            <li>
              <Term>데이터베이스 운영</Term> Supabase
            </li>
            <li>
              <Term>서버 운영</Term> Fly.io
            </li>
            <li>
              <Term>웹 호스팅</Term> Vercel (서울 리전)
            </li>
          </List>
        </Article>

        <Article title="6. 개인정보의 국외 이전">
          <p>
            이용자가 올린 문서의 문자 인식과 쉬운 글 변환은 국내(네이버클라우드)
            에서 처리되고, 데이터베이스(Supabase, 서울)와 웹 호스팅(Vercel,
            서울)도 국내에 있습니다. 다만 서비스 서버가 국외에 있어 처리
            과정에서 아래와 같이 국외를 경유합니다.
          </p>
          <List>
            <li>
              <Term>이전 국가 · 사업자</Term> {OVERSEAS_TRANSFER}
            </li>
            <li>
              <Term>이전 항목</Term> 이용자가 올린 문서 사진 · PDF, 기기 식별값
            </li>
            <li>
              <Term>이전 일시 및 방법</Term> 서비스 이용 시점에 암호화된
              통신(HTTPS)으로 전송
            </li>
            <li>
              <Term>이전 목적</Term> 서비스 서버 운영 및 요청 중계
            </li>
          </List>
          <p>
            국외 이전을 원하지 않는 경우 서비스 이용을 중단할 수 있습니다. 다만
            이 경우 문서 변환 기능을 이용할 수 없습니다.
          </p>
        </Article>

        <Article title="7. 정보주체의 권리와 행사 방법">
          <p>
            이용자는 언제든지 개인정보의 열람 · 정정 · 삭제 · 처리정지를 요구할
            수 있습니다. 아래 연락처로 알려 주시면 지체 없이 처리합니다.
          </p>
          <p>
            다만 쏙쏙은 문서와 변환 결과를 저장하지 않으므로, 변환이 끝난 뒤에는
            열람 · 정정할 대상이 남아 있지 않습니다. 기기 식별값은 이용자가
            브라우저의 저장 데이터를 지우면 함께 삭제됩니다.
          </p>
        </Article>

        <Article title="8. 개인정보의 파기 절차 및 방법">
          <p>
            보유 기간이 지나거나 처리 목적이 끝난 개인정보는 지체 없이
            파기합니다. 전자적 파일은 복구할 수 없는 방법으로 삭제합니다. 문서
            파일과 변환 결과는 위 3항의 기간이 지나면 자동으로 삭제됩니다.
          </p>
        </Article>

        <Article title="9. 개인정보의 안전성 확보 조치">
          <List>
            <li>이용자와 서버 사이의 모든 통신을 HTTPS 로 암호화합니다.</li>
            <li>
              문서와 변환 결과를 영구 저장하지 않고, 위 3항의 기간이 지나면
              자동으로 삭제합니다.
            </li>
            <li>
              개인정보를 처리하는 시스템의 접근 권한을 담당자에게만 부여합니다.
            </li>
          </List>
        </Article>

        <Article title="10. 개인정보 보호책임자">
          <p>
            개인정보 처리에 관한 문의 · 불만 · 피해구제는 아래로 연락해 주시기
            바랍니다.
          </p>
          <List>
            <li>
              <Term>개인정보 보호책임자</Term> {PRIVACY_OFFICER}
            </li>
            <li>
              <Term>전자우편</Term> {CONTACT_EMAIL}
            </li>
          </List>
          <p>
            개인정보 침해에 대한 신고나 상담이 필요하면 개인정보분쟁조정위원회
            (1833-6972), 개인정보침해신고센터(118), 대검찰청(1301),
            경찰청(182)으로 문의할 수 있습니다.
          </p>
        </Article>

        <Article title="11. 개인정보처리방침의 변경">
          <p>
            이 방침의 내용이 바뀌는 경우 변경 사항과 시행일을 서비스 화면에
            공지합니다.
          </p>
        </Article>
      </main>
    </div>
  )
}

const EFFECTIVE_DATE = '2026년 9월 17일'
/** 2026-09-17 백엔드 답변: 하루 지난 기록을 6시간마다 자동으로 지운다 */
const DEVICE_ID_RETENTION =
  '하루가 지나면 자동으로 삭제합니다. 이용 횟수는 매일 자정에 다시 채워집니다.'
/**
 * 2026-09-17 사용자와 정함. 적어 둔 대로 실제로 지워야 하므로, 문의를 처리하고 나면
 * 받은편지함에서도 지운다. 지키지 못할 기간을 적으면 그 자체가 방침 위반이다.
 */
const INQUIRY_RETENTION = '문의 처리가 끝나면 지체 없이 삭제합니다.'
/**
 * 2026-09-17 확인: 문서를 처리하는 곳은 모두 국내다 (네이버클라우드 OCR · AI, Supabase 서울).
 * Vercel 은 /api 를 백엔드로 중계해 올린 문서가 그 망을 지나가는데, 배포 사이트 응답 헤더의
 * x-vercel-id 가 icn1(서울)이라 국내에서 처리된다. 국외는 Fly.io 도쿄 서버 하나뿐이다.
 */
const OVERSEAS_TRANSFER = '일본 — Fly.io(도쿄 리전, 서비스 서버 운영)'
/**
 * 개인정보 처리에 관한 문의 · 불만을 실제로 받는 사람이어야 한다. 아래 전자우편을 받는 사람과 같다
 * (2026-09-17 사용자와 정함). 팀에 따로 대표를 두면 그 사람으로 바꾼다.
 */
const PRIVACY_OFFICER = '서민수 (운영 담당)'

/** 조항 한 덩어리. 결과 화면과 같이 구역 제목은 h2 다 */
function Article({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-body-semibold text-gray-900">{title}</h2>
      <div className="flex flex-col gap-2 text-body-regular text-gray-700">
        {children}
      </div>
    </section>
  )
}

function List({ children }: { children: ReactNode }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-gray-400">
      {children}
    </ul>
  )
}

/** 목록 항목 앞의 굵은 말머리 */
function Term({ children }: { children: ReactNode }) {
  return <span className="text-body-semibold text-gray-900">{children}: </span>
}
