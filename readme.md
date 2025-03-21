# 네이버 이메일 요약 크롬 확장 프로그램

이 크롬 확장 프로그램은 **네이버 이메일**을 자동으로 요약해주는 도구입니다. 이메일 내용을 OpenAI API를 통해 요약하며, 요약된 내용을 손쉽게 확인할 수 있도록 도와줍니다.

## 기능

- 본인의 OpenAI API를 이용해 네이버 이메일 내용 요약
- 메일을 들어가지 않고 메일 내용 미리 보기 제공

## 설치 방법

1. **크롬 웹 스토어에서 확장 프로그램 다운로드**
   - [chrome 웹 스토어](https://chromewebstore.google.com/detail/%EB%84%A4%EC%9D%B4%EB%B2%84-%EB%A9%94%EC%9D%BC-%EC%9A%94%EC%95%BD%EA%B8%B0naver-mail-summ/geddbcdppbknpoomennnelgdngolhibn?authuser=0&hl=ko)

2. **개발자 모드에서 확장 프로그램 추가**
   1. [GitHub 프로젝트 페이지](https://github.com/skykhs3/project-naver-email-summarizer)에서 소스 코드 파일을 다운로드합니다.
   2. 크롬 브라우저에서 [chrome://extensions/](chrome://extensions/) 페이지를 엽니다.
   3. 오른쪽 상단의 **개발자 모드**를 활성화합니다.
   4. **압축 해제된 확장 프로그램을 로드**를 클릭하고 다운로드한 프로젝트 폴더를 선택하여 추가합니다.

## 사용 방법

1. **API 키 입력**
   - 확장 프로그램을 설치한 후, **Popup 창**에서 OpenAI API 키를 입력합니다. 이 API 키는 OpenAI의 텍스트 요약 기능을 사용하는 데 필요합니다.
   - API 키를 입력한 후 **"약관 동의"** 체크박스를 클릭하여 동의하고, 기능을 사용할 수 있습니다.
   
2. **이메일 요약 시작**
   - **"이메일 요약 시작"** 버튼을 클릭하면, 이메일 내용을 OpenAI API로 전송하여 요약된 내용을 제공합니다.

3. **요약 캐시 삭제**
   - **"요약 내용 캐시 삭제"** 버튼을 클릭하여 저장된 요약 데이터를 삭제할 수 있습니다.

## 예시

아래는 이메일 요약 기능이 동작하는 예시 GIF입니다. 이 GIF는 확장 프로그램을 사용하는 방법을 단계별로 보여줍니다.

![이메일 요약 예시](/demo/demo.gif)

<img src="./demo/demo1.png"/>

<img src="./demo/demo2.png"/>

<img src="./demo/demo3.png"/>

## 주의사항

- **API 키는 비공개로 관리하세요**: API 키는 환경 변수로 관리하거나 안전한 방법으로 코드에 삽입하지 않도록 합니다. 이 프로젝트에서는 API 키를 `background.js`에서 사용하는 방식으로 구현했습니다.
- **메일 내용의 보안**: 이 확장 프로그램은 이메일 내용을 OpenAI API에 전송하여 요약을 생성합니다. 개인 정보가 포함된 이메일은 사용하지 않도록 주의해주세요.

## 기여 방법

1. GitHub 레포지토리에서 이 프로젝트를 포크합니다.
2. 기능을 추가하거나 버그를 수정한 후, **pull request**를 생성합니다.
3. 모든 기여는 **CC BY-NC 4.0 라이선스** 하에 이루어집니다.

## 라이선스

이 프로젝트는 [CC BY-NC 4.0 라이선스](LICENSE) 하에 제공됩니다.

---

문의 사항이 있거나 도움말이 필요하면 [GitHub Issues](https://github.com/skykhs3/project-naver-email-summarizer/issues)에서 질문을 남겨주세요.
