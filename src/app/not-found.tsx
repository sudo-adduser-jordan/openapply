import { NotFoundPage } from '@/components/NotFoundPage'

export default function NotFound() {
    return (
        <NotFoundPage
            code='404'
            title='Page not found'
            message="The page you're looking for doesn't exist or has been moved."
            actions={[{ label: 'Browse jobs', href: '/jobs' }]}
        />
    )
}
