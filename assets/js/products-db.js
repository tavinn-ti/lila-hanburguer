// BANCO DE DADOS DE PRODUTOS
const PRODUCTS = [
  {
    id: "l1",
    name: "X-Prensado Tradicional",
    category: "lanches",
    price: 22.00,
    description: "Pão prensado na chapa, hambúrguer artesanal, queijo derretido, presunto, alface, tomate fresco e maionese especial da casa.",
    image: "assets/img/logo.jpeg",
    extras: [
      { name: "Hambúrguer Extra", price: 6.00 },
      { name: "Bacon Crocante", price: 4.00 },
      { name: "Ovo Frito", price: 2.50 },
      { name: "Queijo Extra", price: 3.00 }
    ]
  },
  {
    id: "l2",
    name: "X-Bacon Especial",
    category: "lanches",
    price: 26.00,
    description: "Pão macio, hambúrguer artesanal 160g, fatias generosas de bacon crocante, cheddar derretido e molho barbecue.",
    image: "assets/img/logo.jpeg",
    extras: [
      { name: "Bacon Extra", price: 4.00 },
      { name: "Cheddar Cremoso", price: 3.50 },
      { name: "Cebola Caramelizada", price: 3.00 }
    ]
  },
  {
    id: "p1",
    name: "Batata Frita Especial",
    category: "porcoes",
    price: 25.00,
    description: "Porção generosa de batata palito crocante, coberta com cheddar cremoso e bacon em cubos.",
    image: "assets/img/logo.jpeg",
    extras: [
      { name: "Cheddar Extra", price: 4.00 },
      { name: "Bacon Extra", price: 4.00 },
      { name: "Catupiry", price: 4.50 }
    ]
  },
  {
    id: "p2",
    name: "Calabresa Acebolada",
    category: "porcoes",
    price: 28.00,
    description: "Porção de linguiça calabresa fatiada acebolada na chapa, acompanhada de farofa temperada e pão especial.",
    image: "assets/img/logo.jpeg",
    extras: [
      { name: "Pão Extra", price: 3.00 },
      { name: "Catupiry", price: 4.00 }
    ]
  }
];