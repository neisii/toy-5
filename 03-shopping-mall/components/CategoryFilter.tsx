'use client';

type Props = {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
};

const categories = [
  { id: 'all', name: '전체' },
  { id: 'electronics', name: '전자제품' },
  { id: 'fashion', name: '패션' },
  { id: 'furniture', name: '가구' },
  { id: 'books', name: '도서' },
  { id: 'sports', name: '스포츠' },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded ${
            selectedCategory === category.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
