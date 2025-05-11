import authHeader from './auth-header';
import {
    getCategoriesApiCategoriesGet,
    getCategoryApiCategoriesCategoryIdGet,
    addCategoryApiCategoriesPost,
    editCategoryApiCategoriesCategoryIdPatch,
    deleteCategoryApiCategoriesCategoryIdDelete
} from "@/api/categories/categories";

// Інтерфейси для типізації
interface Category {
    id?: number;
    name: string;
    parent_id?: number | null;
    [key: string]: any;
}

class CategoryService {
    getCategories() {
        return getCategoriesApiCategoriesGet({ headers: authHeader() })
            .then(response => {
                if (response.data) {
                    localStorage.setItem('categories', JSON.stringify(response.data));
                }
                return response;
            })
            .catch(error => {
                console.error('Помилка отримання категорій:', error.response?.data || error.message);
                throw error;
            });
    }

    addCategory(data: Category) {
        return addCategoryApiCategoriesPost(data, { headers: authHeader() })
            .catch(error => {
                console.error('Помилка додавання категорії:', error.response?.data || error.message);
                throw error;
            });
    }

    getCategory(id: number) {
        return getCategoryApiCategoriesCategoryIdGet(id, { headers: authHeader() })
            .catch(error => {
                console.error(`Помилка отримання категорії ${id}:`, error.response?.data || error.message);
                throw error;
            });
    }

    updateCategory(id: number, data: Partial<Category>) {
        return editCategoryApiCategoriesCategoryIdPatch(id, data, { headers: authHeader() })
            .catch(error => {
                console.error(`Помилка оновлення категорії ${id}:`, error.response?.data || error.message);
                throw error;
            });
    }

    deleteCategory(id: number) {
        return deleteCategoryApiCategoriesCategoryIdDelete(id, { headers: authHeader() })
            .catch(error => {
                console.error(`Помилка видалення категорії ${id}:`, error.response?.data || error.message);
                throw error;
            });
    }
}

export default new CategoryService();
