require('dotenv').config();
const { supabase } = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Create sample categories
    console.log('📁 Creating categories...');
    
    const categories = [
      {
        name: 'Véhicules',
        slug: 'vehicules',
        description: 'Voitures, motos, camions et autres véhicules',
        icon: '🚗'
      },
      {
        name: 'Immobilier',
        slug: 'immobilier',
        description: 'Maisons, appartements, terrains',
        icon: '🏠'
      },
      {
        name: 'Électronique',
        slug: 'electronique',
        description: 'Téléphones, ordinateurs, électroménager',
        icon: '📱'
      },
      {
        name: 'Mode & Beauté',
        slug: 'mode-beaute',
        description: 'Vêtements, chaussures, accessoires',
        icon: '👗'
      },
      {
        name: 'Emploi',
        slug: 'emploi',
        description: 'Offres d\'emploi et services',
        icon: '💼'
      },
      {
        name: 'Maison & Jardin',
        slug: 'maison-jardin',
        description: 'Meubles, décoration, jardinage',
        icon: '🪴'
      }
    ];

    const { data: createdCategories, error: categoryError } = await supabase
      .from('categories')
      .insert(categories)
      .select();

    if (categoryError) {
      console.error('❌ Error creating categories:', categoryError);
      return;
    }

    console.log(`✅ Created ${createdCategories.length} categories`);

    // 2. Create sample users
    console.log('👥 Creating users...');
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = [
      {
        name: 'Ahmed Benali',
        email: 'ahmed@example.com',
        password: hashedPassword,
        phone: '+213555123456',
        role: 'USER'
      },
      {
        name: 'Fatima Zohra',
        email: 'fatima@example.com',
        password: hashedPassword,
        phone: '+213555234567',
        role: 'USER'
      },
      {
        name: 'Admin User',
        email: 'admin@ouedkniss.com',
        password: hashedPassword,
        phone: '+213555345678',
        role: 'ADMIN'
      },
      {
        name: 'Karim Saidi',
        email: 'karim@example.com',
        password: hashedPassword,
        phone: '+213555456789',
        role: 'USER'
      },
      {
        name: 'Amina Bouzid',
        email: 'amina@example.com',
        password: hashedPassword,
        phone: '+213555567890',
        role: 'USER'
      }
    ];

    const { data: createdUsers, error: userError } = await supabase
      .from('users')
      .insert(users)
      .select();

    if (userError) {
      console.error('❌ Error creating users:', userError);
      return;
    }

    console.log(`✅ Created ${createdUsers.length} users`);

    // 3. Create sample ads
    console.log('📢 Creating ads...');
    
    const ads = [
      {
        title: 'Toyota Corolla 2020 - Excellent État',
        description: 'Voiture en excellent état, bien entretenue. Kilométrage: 45,000 km. Climatisation, vitres électriques.',
        price: 2500000,
        currency: 'DZD',
        condition: 'USED',
        location: 'Alger, Hydra',
        phone: '+213555123456',
        images: ['https://example.com/car1.jpg', 'https://example.com/car2.jpg'],
        status: 'ACTIVE',
        is_featured: true,
        user_id: createdUsers[0].id,
        category_id: createdCategories[0].id
      },
      {
        title: 'iPhone 14 Pro 256GB - Neuf sous blister',
        description: 'iPhone 14 Pro 256GB couleur Space Black. Neuf, jamais ouvert, sous blister original.',
        price: 180000,
        currency: 'DZD',
        condition: 'NEW',
        location: 'Oran, Es Senia',
        phone: '+213555234567',
        images: ['https://example.com/iphone1.jpg'],
        status: 'ACTIVE',
        is_featured: false,
        user_id: createdUsers[1].id,
        category_id: createdCategories[2].id
      },
      {
        title: 'Appartement F3 à vendre - Bab Ezzouar',
        description: 'Appartement F3 de 85m² au 4ème étage avec ascenseur. Cuisine équipée, balcon, parking.',
        price: 8500000,
        currency: 'DZD',
        condition: 'USED',
        location: 'Alger, Bab Ezzouar',
        phone: '+213555345678',
        images: ['https://example.com/apt1.jpg', 'https://example.com/apt2.jpg'],
        status: 'ACTIVE',
        is_featured: true,
        user_id: createdUsers[2].id,
        category_id: createdCategories[1].id
      },
      {
        title: 'Robe de soirée élégante - Taille M',
        description: 'Magnifique robe de soirée, portée une seule fois. Couleur bleu marine, taille M.',
        price: 15000,
        currency: 'DZD',
        condition: 'USED',
        location: 'Constantine, Centre-ville',
        phone: '+213555456789',
        images: ['https://example.com/dress1.jpg'],
        status: 'ACTIVE',
        is_featured: false,
        user_id: createdUsers[3].id,
        category_id: createdCategories[3].id
      },
      {
        title: 'Poste de Développeur Web - Alger',
        description: 'Recherchons développeur web expérimenté en React/Node.js. Salaire attractif.',
        price: 80000,
        currency: 'DZD',
        condition: 'NEW',
        location: 'Alger, Centre',
        phone: '+213555567890',
        images: [],
        status: 'ACTIVE',
        is_featured: false,
        user_id: createdUsers[4].id,
        category_id: createdCategories[4].id
      },
      {
        title: 'Table en bois massif + 6 chaises',
        description: 'Belle table en bois massif avec 6 chaises assorties. Très bon état.',
        price: 45000,
        currency: 'DZD',
        condition: 'USED',
        location: 'Blida, Centre',
        phone: '+213555123456',
        images: ['https://example.com/table1.jpg'],
        status: 'ACTIVE',
        is_featured: false,
        user_id: createdUsers[0].id,
        category_id: createdCategories[5].id
      }
    ];

    const { data: createdAds, error: adError } = await supabase
      .from('ads')
      .insert(ads)
      .select();

    if (adError) {
      console.error('❌ Error creating ads:', adError);
      return;
    }

    console.log(`✅ Created ${createdAds.length} ads`);

    // 4. Create sample messages
    console.log('💬 Creating messages...');
    
    const messages = [
      {
        content: 'Bonjour, est-ce que la voiture est toujours disponible?',
        sender_id: createdUsers[1].id,
        receiver_id: createdUsers[0].id,
        ad_id: createdAds[0].id,
        is_read: false
      },
      {
        content: 'Oui, elle est disponible. Voulez-vous la voir?',
        sender_id: createdUsers[0].id,
        receiver_id: createdUsers[1].id,
        ad_id: createdAds[0].id,
        is_read: true
      },
      {
        content: 'Le prix est-il négociable pour l\'iPhone?',
        sender_id: createdUsers[3].id,
        receiver_id: createdUsers[1].id,
        ad_id: createdAds[1].id,
        is_read: false
      }
    ];

    const { data: createdMessages, error: messageError } = await supabase
      .from('messages')
      .insert(messages)
      .select();

    if (messageError) {
      console.error('❌ Error creating messages:', messageError);
      return;
    }

    console.log(`✅ Created ${createdMessages.length} messages`);

    // 5. Create sample favorites
    console.log('❤️ Creating favorites...');
    
    const favorites = [
      {
        user_id: createdUsers[1].id,
        ad_id: createdAds[0].id
      },
      {
        user_id: createdUsers[3].id,
        ad_id: createdAds[1].id
      },
      {
        user_id: createdUsers[4].id,
        ad_id: createdAds[2].id
      }
    ];

    const { data: createdFavorites, error: favoriteError } = await supabase
      .from('favorites')
      .insert(favorites)
      .select();

    if (favoriteError) {
      console.error('❌ Error creating favorites:', favoriteError);
      return;
    }

    console.log(`✅ Created ${createdFavorites.length} favorites`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${createdUsers.length}`);
    console.log(`   📁 Categories: ${createdCategories.length}`);
    console.log(`   📢 Ads: ${createdAds.length}`);
    console.log(`   💬 Messages: ${createdMessages.length}`);
    console.log(`   ❤️ Favorites: ${createdFavorites.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Email: ahmed@example.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('✅ Seeding process finished');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Seeding process failed:', error);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
