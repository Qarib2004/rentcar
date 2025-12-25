import { useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/features/cars/hooks/useCars'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Plus,
  Edit,
  Trash2,
  Tag
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { UserRole, type Category } from '@/types'


const initialCategoryForm = {
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

export function Dashboard() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === UserRole.ADMIN

  


  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory()
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory()

  const [categoryFormValues, setCategoryFormValues] = useState(initialCategoryForm)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const isCategoryBusy = isCreating || isUpdating || isDeleting

  const handleCategoryInputChange = (field: keyof typeof initialCategoryForm, value: string) => {
    setCategoryFormValues((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'name' && !slugManuallyEdited && !editingCategory
        ? { slug: slugify(value) }
        : {}),
    }))
  }

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setCategoryFormValues((prev) => ({ ...prev, slug: slugify(value) }))
  }

  const resetCategoryForm = () => {
    setCategoryFormValues(initialCategoryForm)
    setEditingCategory(null)
    setSlugManuallyEdited(false)
    setIsDialogOpen(false)
  }

  const handleCategorySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isAdmin) return

    const payload = {
      name: categoryFormValues.name.trim(),
      slug: categoryFormValues.slug.trim(),
      description: categoryFormValues.description?.trim() || undefined,
      icon: categoryFormValues.icon?.trim() || undefined,
    }

    if (editingCategory) {
      updateCategory(
        { id: editingCategory.id, data: payload },
        {
          onSuccess: resetCategoryForm,
        }
      )
      return
    }

    createCategory(payload, {
      onSuccess: resetCategoryForm,
    })
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormValues({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
    })
    setSlugManuallyEdited(true)
    setIsDialogOpen(true)
  }

  const handleDeleteCategory = (category: Category) => {
    if (!isAdmin) return
    const confirmed = window.confirm(
      `Delete category "${category.name}"? This action cannot be undone.`
    )
    if (!confirmed) return

    deleteCategory(category.id, {
      onSuccess: () => {
        if (editingCategory?.id === category.id) {
          resetCategoryForm()
        }
      },
    })
  }


  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          

          {isAdmin && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Category Management
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Manage car categories</p>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        resetCategoryForm()
                        setIsDialogOpen(true)
                      }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingCategory ? 'Edit Category' : 'Create New Category'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingCategory
                            ? `Updating "${editingCategory.name}"`
                            : 'Add a new category for grouping cars.'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={categoryFormValues.name}
                            onChange={(e) => handleCategoryInputChange('name', e.target.value)}
                            placeholder="e.g. Electric"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="slug">Slug</Label>
                          <Input
                            id="slug"
                            value={categoryFormValues.slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            placeholder="electric"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="icon">Icon (optional)</Label>
                          <Input
                            id="icon"
                            value={categoryFormValues.icon}
                            onChange={(e) => handleCategoryInputChange('icon', e.target.value)}
                            placeholder="lucide-electric"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <textarea
                            id="description"
                            value={categoryFormValues.description}
                            onChange={(e) => handleCategoryInputChange('description', e.target.value)}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            rows={3}
                            placeholder="Short description of the category"
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button type="submit" disabled={isCategoryBusy} className="flex-1">
                            {editingCategory ? 'Update Category' : 'Create Category'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={resetCategoryForm}
                            disabled={isCategoryBusy}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : categories && categories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{category.name}</p>
                          <p className="text-xs text-gray-500">/{category.slug}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {category._count?.cars ?? 0} cars
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditCategory(category)}
                            disabled={isCategoryBusy}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCategory(category)}
                            disabled={isCategoryBusy}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No categories yet</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first category to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

         

         

         
        </div>
    
    </AdminLayout>
  )
}