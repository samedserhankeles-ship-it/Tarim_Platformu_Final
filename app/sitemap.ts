import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tarimpazar.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  try {
    // Active product listings
    const products = await prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 1000, // Limit to prevent too large sitemap
    })

    // Active job postings
    const jobs = await prisma.jobPosting.findMany({
      where: { active: true },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 1000,
    })

    // Dynamic product pages
    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/ilan/prod-${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Dynamic job pages
    const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
      url: `${baseUrl}/ilan/job-${job.id}`,
      lastModified: job.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...productPages, ...jobPages]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    // Return static pages only if database query fails
    return staticPages
  }
}

