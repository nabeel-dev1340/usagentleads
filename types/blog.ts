export interface BlogPost {
  title: string
  description: string
  date: string
  updatedAt?: string
  slug: string
  coverImage: string
  category: string
  tags: string[]
  author: string
  published: boolean
  readingTime: string
}
