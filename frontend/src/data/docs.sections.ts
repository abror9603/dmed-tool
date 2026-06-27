/**
 * API docs structure — endpoint metadata keyed for i18n; curl examples include ngrok header.
 */
import type { ComposerTranslation } from 'vue-i18n'
import type { DocSection } from '../types/docs.types'

const NGROK_HEADER = "--header 'ngrok-skip-browser-warning: true'"

export const docsIntroKeys = {
  title: 'docsPage.introContent.title',
  paragraphs: [
    'docsPage.introContent.p1',
    'docsPage.introContent.p2',
    'docsPage.introContent.p3',
  ],
} as const

export function createDocsSections(baseUrl: string, t: ComposerTranslation): DocSection[] {
  void baseUrl

  return [
    {
      id: 'auth',
      title: t('docsPage.sections.auth'),
      endpoints: [
        {
          id: 'auth-login',
          method: 'POST',
          title: t('docsPage.endpoints.authLogin.title'),
          path: '/sdg/uz/login',
          description: t('docsPage.endpoints.authLogin.description'),
          bodyType: 'query',
          fields: [
            { name: 'login', type: 'string', required: true, description: t('docsPage.fields.login') },
            { name: 'password', type: 'string', required: true, description: t('docsPage.fields.password') },
          ],
          requestExample: (url) => `curl --location --request POST '${url}/sdg/uz/login?login=admin&password=parol123' \\
${NGROK_HEADER}`,
          responseExample: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`,
        },
      ],
    },
    {
      id: 'shablonlar',
      title: t('docsPage.sections.shablonlar'),
      endpoints: [
        {
          id: 'templates-list',
          method: 'GET',
          title: t('docsPage.endpoints.templatesList.title'),
          path: '/api/v1/templates',
          description: t('docsPage.endpoints.templatesList.description'),
          authorization: 'Bearer Token',
          bodyType: 'none',
          requestExample: (url) => `curl --location '${url}/api/v1/templates' \\
--header 'Authorization: Bearer {token}' \\
${NGROK_HEADER}`,
          responseExample: `[
  {
    "id": 1,
    "name": "discharge_alert",
    "content": "Hurmatli shifokor, bemor chiqdi.",
    "status": "ACTIVE"
  }
]`,
        },
        {
          id: 'templates-create',
          method: 'POST',
          title: t('docsPage.endpoints.templatesCreate.title'),
          path: '/api/v1/templates',
          description: t('docsPage.endpoints.templatesCreate.description'),
          authorization: 'Bearer Token',
          bodyType: 'json',
          fields: [
            { name: 'name', type: 'string', required: true, description: t('docsPage.fields.name') },
            { name: 'content', type: 'string', required: true, description: t('docsPage.fields.content') },
          ],
          requestExample: (url) => `curl --location --request POST '${url}/api/v1/templates' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Bearer {token}' \\
${NGROK_HEADER} \\
--data-raw '{
  "name": "discharge_alert",
  "content": "Hurmatli shifokor, bemor chiqdi."
}'`,
          responseExample: `{ "id": 2, "name": "discharge_alert", "status": "ACTIVE" }`,
        },
      ],
    },
    {
      id: 'yuborish',
      title: t('docsPage.sections.yuborish'),
      endpoints: [
        {
          id: 'send-notification',
          method: 'POST',
          title: t('docsPage.endpoints.sendNotification.title'),
          path: '/api/v1/notifications/send',
          description: t('docsPage.endpoints.sendNotification.description'),
          authorization: 'Bearer Token',
          bodyType: 'json',
          fields: [
            { name: 'templateId', type: 'integer', required: true, description: t('docsPage.fields.templateId') },
            { name: 'recipientId', type: 'integer', required: true, description: t('docsPage.fields.recipientId') },
            { name: 'channel', type: 'string', required: true, description: t('docsPage.fields.channel'), example: 'SMS' },
          ],
          requestExample: (url) => `curl --location --request POST '${url}/api/v1/notifications/send' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Bearer {token}' \\
${NGROK_HEADER} \\
--data-raw '{
  "templateId": 1,
  "recipientId": 42,
  "channel": "SMS"
}'`,
          responseExample: `{
  "messageId": "msg_9f3a21",
  "status": "QUEUED"
}`,
        },
      ],
    },
    {
      id: 'hisobotlar',
      title: t('docsPage.sections.hisobotlar'),
      endpoints: [
        {
          id: 'reports-list',
          method: 'GET',
          title: t('docsPage.endpoints.reportsList.title'),
          path: '/api/v1/reports',
          description: t('docsPage.endpoints.reportsList.description'),
          authorization: 'Bearer Token',
          bodyType: 'query',
          fields: [
            { name: 'from', type: 'string', required: false, description: t('docsPage.fields.from'), example: '2026-06-01' },
            { name: 'to', type: 'string', required: false, description: t('docsPage.fields.to'), example: '2026-06-30' },
          ],
          requestExample: (url) => `curl --location '${url}/api/v1/reports?from=2026-06-01&to=2026-06-30' \\
--header 'Authorization: Bearer {token}' \\
${NGROK_HEADER}`,
          responseExample: `{
  "totalSent": 128,
  "delivered": 121,
  "failed": 7
}`,
        },
      ],
    },
  ]
}

export const docsSectionIds = ['intro', 'auth', 'shablonlar', 'yuborish', 'hisobotlar'] as const
export type DocsSectionId = (typeof docsSectionIds)[number]
