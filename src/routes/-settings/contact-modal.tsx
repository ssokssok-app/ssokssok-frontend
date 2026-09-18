import { Modal, ModalClose, ModalTextButton } from '@/components/modal'
import { CONTACT_EMAIL } from '@/lib/contact'

interface ContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * 1:1 문의 안내. 홈 설정 메뉴와 설정 화면이 같이 쓴다.
 * Figma 에 없는 창이라 일러스트 없이 Modal 을 쓴다 (docs/product.md "확인 필요").
 * mailto 만 걸면 메일 앱이 없거나 계정이 설정되지 않은 기기에서 눌러도 아무 일이 없어,
 * 주 사용자가 고장으로 오해한다. 그래서 주소를 글자로도 보여 준다
 */
export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="문의는 메일로 보내주세요"
      description={`${CONTACT_EMAIL}\n\n아래 버튼이 눌리지 않으면\n이 주소로 메일을 보내주세요.`}
    >
      <ModalClose
        onClick={() => {
          window.location.href = `mailto:${CONTACT_EMAIL}`
        }}
      >
        메일 보내기
      </ModalClose>
      <ModalTextButton onClick={() => onOpenChange(false)}>
        닫기
      </ModalTextButton>
    </Modal>
  )
}
