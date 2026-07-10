interface TagResponse {
  id: number,
  tag: string,
  count?: string
}

interface TagWithCount {
  id: number,
  tag: string,
  color: string,
  count: number
}

interface ResourceResponse {
  id: number,
  url: string,
  userId: string,
  tags: TagResponse[]
}

interface ResourceRequest {
  url: string
}

export {
  type TagResponse,
  type ResourceResponse,
  type ResourceRequest,
  type TagWithCount
}
