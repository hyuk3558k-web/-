// required: true = 필수 (학원 전날), false = 선택 (시간 남을 때)
export const HOMEWORK_TEMPLATES = {
  juwon: {
    daily: [
      { label: '엠베스트', duration: 60, required: true }
    ],
    beforeAcademy: {
      '수학학원': [
        { label: '수학 숙제', duration: 60, required: true }
      ]
    }
  },
  yewon: {
    daily: [],
    beforeAcademy: {
      '영어학원': [
        { label: '영어 단어+워크북', duration: 30, required: true }
      ],
      '수학학원': [
        { label: '수학 숙제', duration: 60, required: true }
      ]
    },
    optional: [
      { label: '러닝포털', duration: 30, required: false },
      { label: '국어+한자', duration: 30, required: false }
    ]
  },
  chaewon: {
    daily: [],
    beforeAcademy: {
      '영어학원': [
        { label: '영어 단어+워크북', duration: 30, required: true }
      ],
      '수학학원': [
        { label: '수학 숙제', duration: 60, required: true }
      ]
    },
    optional: [
      { label: '러닝포털', duration: 30, required: false },
      { label: '국어+한자', duration: 30, required: false }
    ]
  }
}
