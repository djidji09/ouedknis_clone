const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ouedkniss.com' },
    update: {},
    create: {
      email: 'admin@ouedkniss.com',
      name: 'System Administrator',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+213555000000'
    }
  });

  console.log('✅ Admin user created:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'user@ouedkniss.com' },
    update: {},
    create: {
      email: 'user@ouedkniss.com',
      name: 'Test User',
      password: userPassword,
      role: 'USER',
      phone: '+213555111111'
    }
  });

  console.log('✅ Test user created:', testUser.email);

  // Create main categories
  const categories = [
    {
      name: 'Véhicules',
      description: 'Voitures, motos, pièces détachées',
      icon: '🚗',
      subcategories: [
        { name: 'Voitures', description: 'Voitures d\'occasion et neuves' },
        { name: 'Motos', description: 'Motos et scooters' },
        { name: 'Pièces détachées', description: 'Pièces pour véhicules' },
        { name: 'Accessoires auto', description: 'Accessoires pour voitures' }
      ]
    },
    {
      name: 'Immobilier',
      description: 'Appartements, maisons, terrains',
      icon: '🏠',
      subcategories: [
        { name: 'Appartements', description: 'Vente et location d\'appartements' },
        { name: 'Maisons', description: 'Vente et location de maisons' },
        { name: 'Terrains', description: 'Terrains à vendre' },
        { name: 'Bureaux', description: 'Locaux commerciaux et bureaux' }
      ]
    },
    {
      name: 'Électronique',
      description: 'Téléphones, ordinateurs, électroménager',
      icon: '📱',
      subcategories: [
        { name: 'Téléphones', description: 'Smartphones et téléphones' },
        { name: 'Ordinateurs', description: 'PC, laptops, tablettes' },
        { name: 'Électroménager', description: 'Appareils électroménagers' },
        { name: 'TV & Audio', description: 'Télévisions et équipements audio' }
      ]
    },
    {
      name: 'Mode & Beauté',
      description: 'Vêtements, chaussures, accessoires',
      icon: '👗',
      subcategories: [
        { name: 'Vêtements femme', description: 'Mode féminine' },
        { name: 'Vêtements homme', description: 'Mode masculine' },
        { name: 'Chaussures', description: 'Chaussures pour tous' },
        { name: 'Accessoires', description: 'Bijoux, sacs, montres' }
      ]
    },
    {
      name: 'Maison & Jardin',
      description: 'Meubles, décoration, jardinage',
      icon: '🏡',
      subcategories: [
        { name: 'Meubles', description: 'Mobilier pour la maison' },
        { name: 'Décoration', description: 'Articles de décoration' },
        { name: 'Jardinage', description: 'Outils et plantes de jardin' },
        { name: 'Bricolage', description: 'Outils et matériaux de bricolage' }
      ]
    },
    {
      name: 'Emploi',
      description: 'Offres d\'emploi et services',
      icon: '💼',
      subcategories: [
        { name: 'CDI', description: 'Emplois à durée indéterminée' },
        { name: 'CDD', description: 'Emplois à durée déterminée' },
        { name: 'Freelance', description: 'Missions freelance' },
        { name: 'Stage', description: 'Offres de stage' }
      ]
    }
  ];

  for (const categoryData of categories) {
    const { subcategories, ...mainCategory } = categoryData;
    
    const category = await prisma.category.upsert({
      where: { 
        name_parentId: { 
          name: mainCategory.name, 
          parentId: null 
        } 
      },
      update: {},
      create: mainCategory
    });

    console.log(`✅ Category created: ${category.name}`);

    // Create subcategories
    for (const subCat of subcategories) {
      const subcategory = await prisma.category.upsert({
        where: { 
          name_parentId: { 
            name: subCat.name, 
            parentId: category.id 
          } 
        },
        update: {},
        create: {
          ...subCat,
          parentId: category.id
        }
      });

      console.log(`  ✅ Subcategory created: ${subcategory.name}`);
    }
  }

  // Create sample ads
  const carCategory = await prisma.category.findFirst({
    where: { name: 'Voitures' }
  });

  const phoneCategory = await prisma.category.findFirst({
    where: { name: 'Téléphones' }
  });

  if (carCategory) {
    const carAd = await prisma.ad.create({
      data: {
        title: 'Renault Clio 2018 - Excellent État',
        description: 'Voiture en excellent état, entretien régulier, climatisation, direction assistée. Idéale pour la ville.',
        price: 1500000,
        location: 'Alger Centre',
        condition: 'GOOD',
        userId: testUser.id,
        categoryId: carCategory.id,
        images: {
          create: [
            { url: 'https://example.com/car1.jpg', isMain: true },
            { url: 'https://example.com/car2.jpg', isMain: false }
          ]
        }
      }
    });

    console.log('✅ Sample car ad created');
  }

  if (phoneCategory) {
    const phoneAd = await prisma.ad.create({
      data: {
        title: 'iPhone 13 Pro - Comme Neuf',
        description: 'iPhone 13 Pro 256GB, couleur bleu, avec boîte et accessoires. Aucune rayure, protection écran depuis l\'achat.',
        price: 120000,
        location: 'Oran',
        condition: 'LIKE_NEW',
        userId: testUser.id,
        categoryId: phoneCategory.id,
        images: {
          create: [
            { url: 'https://example.com/iphone1.jpg', isMain: true }
          ]
        }
      }
    });

    console.log('✅ Sample phone ad created');
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
