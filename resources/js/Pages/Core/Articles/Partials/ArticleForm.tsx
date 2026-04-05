import { useForm, router } from '@inertiajs/react'
import { useTranslation } from '@/lib/i18n'
import { Article } from '@/types'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import { Switch } from '@/Components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'
import { TipTapEditor } from '@/Components/TipTapEditor'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useRef, useState } from 'react'

interface ArticleFormProps {
    article?: Article | null
    onSuccess?: () => void
}

export default function ArticleForm({ article, onSuccess }: ArticleFormProps) {
    const { t } = useTranslation()
    const [featuredPreview, setFeaturedPreview] = useState<string>(article?.featured_image || '')
    const featuredInputRef = useRef<HTMLInputElement>(null)

    const { data, setData, post, put, errors, processing, reset } = useForm({
        title: article?.title ?? '',
        slug: article?.slug ?? '',
        excerpt: article?.excerpt ?? '',
        content: article?.content ?? '',
        status: article?.status ?? 'draft',
        is_public: article?.is_public ?? true,
        published_at: article?.published_at ? article.published_at.slice(0, 16) : '',
        featured_image: null as File | null,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('title', data.title)
        formData.append('slug', data.slug)
        formData.append('excerpt', data.excerpt)
        formData.append('content', data.content)
        formData.append('status', data.status)
        formData.append('is_public', data.is_public ? '1' : '0')
        formData.append('published_at', data.published_at)
        if (data.featured_image) {
            formData.append('featured_image', data.featured_image)
        }

        if (article) {
            formData.append('_method', 'PUT')
            router.post(route('articles.update', article.id), formData, {
                onSuccess: () => { reset(); onSuccess?.() },
                forceFormData: true,
            })
        } else {
            router.post(route('articles.store'), formData, {
                onSuccess: () => { reset(); setFeaturedPreview(''); onSuccess?.() },
                forceFormData: true,
            })
        }
    }

    const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setData('featured_image', file)
        const reader = new FileReader()
        reader.onload = (ev) => setFeaturedPreview(ev.target?.result as string)
        reader.readAsDataURL(file)
    }

    const handleImageUploadForEditor = async (file: File): Promise<string> => {
        if (!article) return ''
        return new Promise((resolve, reject) => {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('collection', 'gallery')
            fetch(route('articles.media.upload', article.id), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '' },
                body: formData,
            })
                .then(r => r.json())
                .then(d => resolve(d.url))
                .catch(reject)
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
                <Label htmlFor="title">{t('Title')} *</Label>
                <Input
                    id="title"
                    value={data.title}
                    onChange={e => setData('title', e.target.value)}
                    placeholder={t('Article title')}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
                <Label htmlFor="slug">{t('Slug')}</Label>
                <Input
                    id="slug"
                    value={data.slug}
                    onChange={e => setData('slug', e.target.value)}
                    placeholder={t('auto-generated-from-title')}
                    className="font-mono text-sm"
                />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
            </div>

            {/* Status + is_public row */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="space-y-1.5 flex-1">
                    <Label>{t('Status')}</Label>
                    <Select value={data.status} onValueChange={v => setData('status', v as any)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">{t('Draft')}</SelectItem>
                            <SelectItem value="published">{t('Published')}</SelectItem>
                            <SelectItem value="archived">{t('Archived')}</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                </div>

                <div className="space-y-1.5 flex-1">
                    <Label htmlFor="published_at">{t('Publish date')}</Label>
                    <Input
                        id="published_at"
                        type="datetime-local"
                        value={data.published_at}
                        onChange={e => setData('published_at', e.target.value)}
                    />
                    {errors.published_at && <p className="text-sm text-destructive">{errors.published_at}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label>{t('Public access')}</Label>
                    <div className="flex items-center gap-2 h-9">
                        <Switch
                            checked={data.is_public}
                            onCheckedChange={v => setData('is_public', v)}
                        />
                        <span className="text-sm text-muted-foreground">
                            {data.is_public ? t('Visible without login') : t('Requires login')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Featured image */}
            <div className="space-y-1.5">
                <Label>{t('Featured image')}</Label>
                <div
                    className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => featuredInputRef.current?.click()}
                >
                    {featuredPreview ? (
                        <div className="relative">
                            <img src={featuredPreview} alt="" className="max-h-48 rounded object-cover mx-auto" />
                            <button
                                type="button"
                                className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                onClick={e => { e.stopPropagation(); setFeaturedPreview(''); setData('featured_image', null); if (featuredInputRef.current) featuredInputRef.current.value = '' }}
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground py-4">
                            <ImageIcon className="size-8" />
                            <span className="text-sm">{t('Click to upload featured image')}</span>
                        </div>
                    )}
                </div>
                <input
                    ref={featuredInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFeaturedImageChange}
                />
                {errors.featured_image && <p className="text-sm text-destructive">{errors.featured_image}</p>}
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
                <Label htmlFor="excerpt">{t('Excerpt')}</Label>
                <Textarea
                    id="excerpt"
                    value={data.excerpt}
                    onChange={e => setData('excerpt', e.target.value)}
                    placeholder={t('Short description of the article')}
                    rows={3}
                />
                {errors.excerpt && <p className="text-sm text-destructive">{errors.excerpt}</p>}
            </div>

            {/* Content */}
            <div className="space-y-1.5">
                <Label>{t('Content')}</Label>
                <TipTapEditor
                    value={data.content}
                    onChange={v => setData('content', v)}
                    placeholder={t('Write article content here...')}
                    onImageUpload={article ? handleImageUploadForEditor : undefined}
                />
                {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={processing}>
                    {processing ? t('Saving...') : article ? t('Update Article') : t('Create Article')}
                </Button>
            </div>
        </form>
    )
}
