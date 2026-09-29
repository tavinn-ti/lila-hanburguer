// BANCO DE DADOS DE ADICIONAIS
const EXTRAS_DB = [
    { id: 'add-hamb', name: 'Hambúrguer 180g', price: 8.00 },
    { id: 'add-mussarela', name: 'Mussarela', price: 5.00 },
    { id: 'add-bacon', name: 'Bacon', price: 6.00 },
    { id: 'add-mussarela-emp', name: 'Mussarela Empanada', price: 8.00 },
    { id: 'add-calabresa', name: 'Calabresa', price: 5.00 },
    { id: 'add-omelete', name: 'Omelete de Queijo', price: 5.00 },
    { id: 'add-cream-cheese', name: 'Cream Cheese', price: 8.00 },
    { id: 'add-geleia', name: 'Geleia de Abacaxi', price: 4.00 },
    { id: 'add-ovo', name: 'Ovo Frito', price: 3.00 }
];

// PRODUTOS COM IMAGENS HD DA INTERNET
const PRODUCTS_DB = [
    {
        id: 'lila-01',
        category: 'lanches',
        name: 'X-PRENSADO',
        price: 32.00,
        description: 'Pão, Hambúrguer 180g, Mussarela, tomate, alface, Cebola Roxa, Presunto e ovo frito (tudo prensado).',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
        fallbackImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'lila-02',
        category: 'lanches',
        name: 'X-DIFERENTÃO',
        price: 44.00,
        description: 'Pão, Hambúrguer 180g, 2 fatias de Bacon, Cream Cheese, Tomate, Alface, Cebola Roxa, Geleia de Abacaxi com Pimenta.',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        fallbackImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'lila-03',
        category: 'lanches',
        name: 'X-BAGUETE',
        price: 42.00,
        description: 'Pão baguete, Carne Desfiada, Cebola Roxa, Tomate, Queijo Mussarela, Calabresa e Cream Cheese.',
        image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
        fallbackImage: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'lila-04',
        category: 'lanches',
        name: 'X-EMPANADO',
        price: 48.00,
        description: 'Pão, Hambúrguer 180g, Mussarela Empanada, 2 Fatias de Bacon, Alface, Cebola Roxa, Tomate e Maionese de Bacon.',
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
        fallbackImage: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'pet-01',
        category: 'porcoes',
        name: 'BATATA FRITA (200g)',
        price: 22.00,
        description: 'Porção crocante de batata frita servida bem quentinha (200 gramas).',
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
        fallbackImage: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80'
    },
    {
        id: 'pet-02',
        category: 'porcoes',
        name: 'CALABRESA ACEBOLADA (300g)',
        price: 25.00,
        description: 'Porção generosa de calabresa frita acebolada servida no prato (300 gramas).',
        image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
        fallbackImage: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80'
    }
];