interface TagResponse {
  id: number,
  tag: string
}

interface ResourceResponse {
  id: number,
  url: string,
  userId: number,
  tags: TagResponse[]
}

export { type TagResponse, type ResourceResponse }
