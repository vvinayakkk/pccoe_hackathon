interface Activity {
    id: string;
    document_name: string;
    activity_type: string;
    user_name: string;
    activity_time: string;
    amount: number;
    quantity: number;
    status: 'PENDING' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';
}

interface Product {
    id: string;
    document_name: string;
    activity_type: string;
    user_name: string;
    activity_time: string;
    price: number;
    category: string;
    quantity: number;
    status: 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK';
    rating: number;
}

interface ProductWithActivities extends Product {
    activities: Activity[];
}

export const ProductService = {
    getProductsData(): Product[] {
        return [
            {
                id: '2001',
                document_name: 'Bamboo Watch',
                activity_type: 'Product',
                user_name: 'David James',
                activity_time: '2024-03-15T10:30:00Z',
                price: 65,
                category: 'Accessories',
                quantity: 24,
                status: 'INSTOCK',
                rating: 5
            },
            {
                id: '2002',
                document_name: 'Black Watch',
                activity_type: 'Product',
                user_name: 'Sarah Wilson',
                activity_time: '2024-03-14T09:15:00Z',
                price: 72,
                category: 'Accessories',
                quantity: 61,
                status: 'INSTOCK',
                rating: 4
            },
            // ... other products
        ];
    },

    getProductsWithOrdersData(): ProductWithActivities[] {
        return [
            {
                id: '3001',
                document_name: 'Bamboo Watch',
                activity_type: 'Order',
                user_name: 'David James',
                activity_time: '2024-03-15T10:30:00Z',
                price: 65,
                category: 'Accessories',
                quantity: 24,
                status: 'INSTOCK',
                rating: 5,
                activities: [
                    {
                        id: '3001-1',
                        document_name: 'Order_Processing',
                        activity_type: 'Purchase',
                        user_name: 'David James',
                        activity_time: '2024-03-13T14:20:00Z',
                        amount: 65,
                        quantity: 1,
                        status: 'PENDING'
                    },
                    // ... other activities
                ]
            },
            // ... other products with activities
        ];
    },

    getProductsMini(): Promise<Product[]> {
        return Promise.resolve(this.getProductsData().slice(0, 5));
    },

    getProductsSmall(): Promise<Product[]> {
        return Promise.resolve(this.getProductsData().slice(0, 10));
    },

    getProducts(): Promise<Product[]> {
        return Promise.resolve(this.getProductsData());
    },

    getProductsWithOrdersSmall(): Promise<ProductWithActivities[]> {
        return Promise.resolve(this.getProductsWithOrdersData().slice(0, 10));
    },

    getProductsWithOrders(): Promise<ProductWithActivities[]> {
        return Promise.resolve(this.getProductsWithOrdersData());
    }
};