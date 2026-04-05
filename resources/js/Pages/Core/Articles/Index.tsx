import { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { PageProps, Article } from '@/types'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Badge } from '@/Components/ui/badge'
import {
    Card, CardContent, CardHeader, CardTitle,
} from '@/Components/ui/card'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/Components/ui/sheet'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/alert-dialog'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/Components/ui/table'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu'
import {
    Plus, Search, Pencil, Trash2, MoreHorizontal,
    Globe, Lock, FileText, Eye, Archive,
} from 'lucide-react'
import ArticleForm from './Partials/ArticleForm'
import { cn } from '@/lib/utils'

interface Props extends PageProps {
    articles: Article[]
}

function StatusBadge({ status }: { status: Article['status'] }) {
    const { t } = useTranslation()
    const map = {
        draft:     { label: t('Draft'),     className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
        published: { label: t('Published'), className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
        archived:  { label: t('Archived'),  className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    }
    const { label, className } = map[status]
    return <Badge className={cn('font-normal', className)}>{label}</Badge>
}

function AccessBadge({ isPublic }: { isPublic: boolean }) {
    const { t } = useTranslation()
    return isPublic
        ? <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><Globe className="size-3" />{t('Public')}</span>
        : <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400"><Lock className="size-3" />{t('Private')}</span>
}

export default function ArticlesIndex({ articles }: Props) {
    const { t } = useTranslation()
    const { auth } = usePage<Props>().props
    const userPermissions = auth.user.permissions ?? []

    const canCreate = userPermissions.includes('articles.create')
    const canEdit   = userPermissions.includes('articles.edit')
    const canDelete = userPermissions.includes('articles.delete')

    const [search, setSearch] = useState('')
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [editingArticle, setEditingArticle] = useState<Article | null>(null)
    const [deletingArticle, setDeletingArticle] = useState<Article | null>(null)

    const filtered = articles.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.author.name.toLowerCase().includes(search.toLowerCase()) ||
        a.slug.toLowerCase().includes(search.toLowerCase())
    )

    const openCreate = () => { setEditingArticle(null); setIsSheetOpen(true) }
    const openEdit   = (a: Article) => { setEditingArticle(a); setIsSheetOpen(true) }

    const confirmDelete = () => {
        if (!deletingArticle) return
        router.delete(route('articles.destroy', deletingArticle.id), {
            onSuccess: () => setDeletingArticle(null),
        })
    }

    const formatDate = (iso?: string | null) => {
        if (!iso) return '—'
        return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    }

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl leading-tight">{t('Articles')}</h2>}>
            <Head title={t('Articles')} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                            <CardTitle className="text-lg">{t('Articles management')}</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder={t('Search articles...')}
                                        className="pl-8 w-56"
                                    />
                                </div>
                                {canCreate && (
                                    <Button onClick={openCreate} size="sm">
                                        <Plus className="size-4 mr-1" />
                                        {t('Add Article')}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>{t('Title')}</TableHead>
                                        <TableHead>{t('Status')}</TableHead>
                                        <TableHead>{t('Access')}</TableHead>
                                        <TableHead>{t('Author')}</TableHead>
                                        <TableHead>{t('Published')}</TableHead>
                                        <TableHead>{t('Created')}</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                                <FileText className="size-8 mx-auto mb-2 opacity-30" />
                                                {search ? t('No articles match your search.') : t('No articles yet.')}
                                            </TableCell>
                                        </TableRow>
                                    ) : filtered.map(article => (
                                        <TableRow
                                            key={article.id}
                                            className={cn(article.deleted_at && 'opacity-50')}
                                        >
                                            <TableCell className="pr-0">
                                                {article.featured_image_thumb ? (
                                                    <img
                                                        src={article.featured_image_thumb}
                                                        alt=""
                                                        className="size-10 rounded object-cover"
                                                    />
                                                ) : (
                                                    <div className="size-10 rounded bg-muted flex items-center justify-center">
                                                        <FileText className="size-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{article.title}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{article.slug}</div>
                                            </TableCell>
                                            <TableCell><StatusBadge status={article.status} /></TableCell>
                                            <TableCell><AccessBadge isPublic={article.is_public} /></TableCell>
                                            <TableCell className="text-sm">{article.author.name}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatDate(article.published_at)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatDate(article.created_at)}</TableCell>
                                            <TableCell>
                                                {(canEdit || canDelete) && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="size-8">
                                                                <MoreHorizontal className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {canEdit && (
                                                                <DropdownMenuItem onClick={() => openEdit(article)}>
                                                                    <Pencil className="size-4 mr-2" />
                                                                    {t('Edit')}
                                                                </DropdownMenuItem>
                                                            )}
                                                            {canDelete && (
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() => setDeletingArticle(article)}
                                                                >
                                                                    <Trash2 className="size-4 mr-2" />
                                                                    {t('Delete')}
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create / Edit Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingArticle ? t('Edit Article') : t('Add Article')}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                        <ArticleForm
                            article={editingArticle}
                            onSuccess={() => setIsSheetOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Delete confirmation */}
            <AlertDialog open={!!deletingArticle} onOpenChange={open => !open && setDeletingArticle(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('Delete Article')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('Are you sure you want to delete')} <strong>{deletingArticle?.title}</strong>?
                            {' '}{t('This action cannot be undone.')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            {t('Delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    )
}
