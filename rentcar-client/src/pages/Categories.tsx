import { useState } from 'react'
import Header from '@/components/layout/Header'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/features/cars/hooks/useCars'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import EmptyState from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Tag, Plus, Edit, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { UserRole, type Category } from '@/types'

const initialForm = {
  name: '',
  slug: '',
  description: '',
  icon: '',
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export default function Categories() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === UserRole.ADMIN

  const { data: categories, isLoading } = useCategories()
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory()
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory()

  const [formValues, setFormValues] = useState(initialForm)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const isBusy = isCreating || isUpdating || isDeleting

  const handleInputChange = (field: keyof typeof initialForm, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'name' && !slugManuallyEdited && !editingCategory
        ? { slug: slugify(value) }
        : {}),
    }))
  }

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setFormValues((prev) => ({ ...prev, slug: slugify(value) }))
  }

  const resetForm = () => {
    setFormValues(initialForm)
    setEditingCategory(null)
    setSlugManuallyEdited(false)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isAdmin) return

    const payload = {
      name: formValues.name.trim(),
      slug: formValues.slug.trim(),
      description: formValues.description?.trim() || undefined,
      icon: formValues.icon?.trim() || undefined,
    }

    if (editingCategory) {
      updateCategory(
        { id: editingCategory.id, data: payload },
        {
          onSuccess: resetForm,
        }
      )
      return
    }

    createCategory(payload, {
      onSuccess: resetForm,
    })
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormValues({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
    })
    setSlugManuallyEdited(true)
  }

  const handleDelete = (category: Category) => {
    if (!isAdmin) return
    const confirmed = window.confirm(
      `Delete category "${category.name}"? This action cannot be undone.`
    )
    if (!confirmed) return

    deleteCategory(category.id, {
      onSuccess: () => {
        if (editingCategory?.id === category.id) {
          resetForm()
        }
      },
    })
  }

  if (!isAdmin) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <EmptyState
            icon={Tag}
            title="Access restricted"
            description="Only administrators can manage categories."
          />
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
            <p className="mt-2 text-gray-600">
              Create, edit, or remove car categories used across the marketplace.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{editingCategory ? 'Edit category' : 'Create category'}</CardTitle>
                <CardDescription>
                  {editingCategory
                    ? `Updating "${editingCategory.name}"`
                    : 'Add a new category for grouping cars.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formValues.name}
                      onChange={(event) => handleInputChange('name', event.target.value)}
                      placeholder="e.g. Electric"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formValues.slug}
                      onChange={(event) => handleSlugChange(event.target.value)}
                      placeholder="electric"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon (optional)</Label>
                    <Input
                      id="icon"
                      value={formValues.icon}
                      onChange={(event) => handleInputChange('icon', event.target.value)}
                      placeholder="lucide-electric"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={formValues.description}
                      onChange={(event) => handleInputChange('description', event.target.value)}
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      rows={4}
                      placeholder="Short description of the category"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={isBusy}>
                      {editingCategory ? 'Update category' : 'Create category'}
                    </Button>
                    {editingCategory && (
                      <Button type="button" variant="ghost" onClick={resetForm} disabled={isBusy}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing categories</CardTitle>
                <CardDescription>Review and manage all available categories.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : categories && categories.length > 0 ? (
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-500">/{category.slug}</p>
                          {category.description && (
                            <p className="mt-2 text-sm text-gray-600">{category.description}</p>
                          )}
                          <p className="mt-2 text-xs uppercase tracking-wide text-gray-500">
                            {category._count?.cars ?? 0} cars linked
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            disabled={isBusy}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(category)}
                            disabled={isBusy}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Plus}
                    title="No categories yet"
                    description="Create your first category to group cars."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

