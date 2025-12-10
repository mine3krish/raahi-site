import { MetadataRoute } from 'next'
import { connectDB } from './api/connect'
import Property from '@/models/Property'
import Community from '@/models/Community'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://raahiauction.com'
  
  // Static pages
  const routes = [
    '',
    '/properties',
    '/communities',
    '/contact',
    '/join',
    '/about',
    '/team',
    '/privacy-policy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    await connectDB()

    // Fetch all active properties
    const properties = await Property.find({ status: 'Active' })
      .select('id updatedAt')
      .limit(5000)
      .lean()

    const propertyUrls = properties.map((property) => ({
      url: `${baseUrl}/properties/${property.id}`,
      lastModified: property.updatedAt ? new Date(property.updatedAt).toISOString() : new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Fetch all communities
    const communities = await Community.find()
      .select('id updatedAt')
      .limit(1000)
      .lean()

    const communityUrls = communities.map((community) => ({
      url: `${baseUrl}/communities/${community.id}`,
      lastModified: community.updatedAt ? new Date(community.updatedAt).toISOString() : new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...routes, ...propertyUrls, ...communityUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return routes
  }
}
