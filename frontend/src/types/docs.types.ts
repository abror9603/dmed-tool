export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type DocBodyType = 'json' | 'formdata' | 'query' | 'none'

export interface DocField {
  name: string
  type: string
  required: boolean
  description: string
  example?: string
}

export interface DocEndpoint {
  id: string
  method: HttpMethod
  title: string
  path: string
  description: string
  authorization?: string
  bodyType?: DocBodyType
  fields?: DocField[]
  requestExample: (baseUrl: string) => string
  responseExample: string
}

export interface DocSection {
  id: string
  title: string
  endpoints: DocEndpoint[]
}

export interface DocIntro {
  title: string
  paragraphs: string[]
}
