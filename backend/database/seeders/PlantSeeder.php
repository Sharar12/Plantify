<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plants = [
            [
                'name' => 'Aloe Vera',
                'scientific_name' => 'Aloe barbadensis',
                'category' => 'Succulent',
                'price' => 15.99,
                'thumbnail' => '/storage/uploads/aloe-vera.jpg',
                'images' => json_encode(['/storage/uploads/aloe-vera.jpg', '/storage/uploads/snake-plant.jpg', '/storage/uploads/jade-plant.jpg', '/storage/uploads/zz-plant.jpg']),
                'stock' => 421,
                'average_rating' => 4.5,
                'reviews_count' => 120,
                'sold' => 16,
                'description' => 'Aloe Vera is a succulent plant species of the genus Aloe. It grows abundantly in tropical climates and has been widely used in herbal medicine.',
                'care_tips' => 'Water deeply but infrequently. Allow soil to dry out between waterings. Bright, indirect sunlight. Well-draining soil is essential.',
            ],
            [
                'name' => 'Snake Plant',
                'scientific_name' => 'Sansevieria trifasciata',
                'category' => 'Air Purifying',
                'price' => 24.99,
                'thumbnail' => '/storage/uploads/snake-plant.jpg',
                'images' => json_encode(['/storage/uploads/snake-plant.jpg', '/storage/uploads/peace-lily.jpg', '/storage/uploads/pothos.jpg', '/storage/uploads/monstera-deliciosa.jpg']),
                'stock' => 30,
                'average_rating' => 4.8,
                'reviews_count' => 85,
                'sold' => 4,
                'description' => 'The Snake Plant, also known as Mother-in-Law\'s Tongue, is a hardy plant that can survive in low light and with little water.',
                'care_tips' => 'Very low maintenance. Water only when soil is completely dry. Tolerates low light but prefers indirect light. Avoid overwatering.',
            ],
            [
                'name' => 'Monstera Deliciosa',
                'scientific_name' => 'Monstera deliciosa',
                'category' => 'Tropical',
                'price' => 35.99,
                'thumbnail' => '/storage/uploads/monstera-deliciosa.jpg',
                'images' => json_encode(['/storage/uploads/monstera-deliciosa.jpg', '/storage/uploads/fiddle-leaf-fig.jpg', '/storage/uploads/calathea-orbifolia.jpg', '/storage/uploads/aloe-vera.jpg']),
                'stock' => 20,
                'average_rating' => 4.6,
                'reviews_count' => 95,
                'sold' => 2,
                'description' => 'Monstera deliciosa, also known as the Swiss Cheese Plant, is famous for its large, glossy leaves with natural holes.',
                'care_tips' => 'Bright, indirect light. Water when top inch of soil is dry. Loves humidity - mist leaves regularly. Support with a moss pole.',
            ],
            [
                'name' => 'Peace Lily',
                'scientific_name' => 'Spathiphyllum',
                'category' => 'Air Purifying',
                'price' => 18.99,
                'thumbnail' => '/storage/uploads/peace-lily.jpg',
                'images' => json_encode(['/storage/uploads/peace-lily.jpg', '/storage/uploads/snake-plant.jpg', '/storage/uploads/bird-of-paradise.jpg', '/storage/uploads/string-of-pearls.jpg']),
                'stock' => 40,
                'average_rating' => 4.3,
                'reviews_count' => 70,
                'sold' => 2,
                'description' => 'Peace Lily is a popular houseplant that produces beautiful white flowers and is excellent at filtering indoor air pollutants.',
                'care_tips' => 'Keep soil consistently moist but not soggy. Low to medium light. Wipe leaves to keep them dust-free. Yellow leaves indicate overwatering.',
            ],
            [
                'name' => 'Jade Plant',
                'scientific_name' => 'Crassula ovata',
                'category' => 'Succulent',
                'price' => 12.99,
                'thumbnail' => '/storage/uploads/jade-plant.jpg',
                'images' => json_encode(['/storage/uploads/jade-plant.jpg', '/storage/uploads/aloe-vera.jpg', '/storage/uploads/zz-plant.jpg', '/storage/uploads/pothos.jpg']),
                'stock' => 60,
                'average_rating' => 4.7,
                'reviews_count' => 110,
                'sold' => 3,
                'description' => 'Jade Plant is a popular succulent houseplant with thick, woody stems and oval-shaped leaves. It\'s considered a symbol of good luck.',
                'care_tips' => 'Water thoroughly, then allow soil to dry out before watering again. Bright light to full sun. Protect from frost. Prune to maintain shape.',
            ],
            [
                'name' => 'Fiddle Leaf Fig',
                'scientific_name' => 'Ficus lyrata',
                'category' => 'Tropical',
                'price' => 45.99,
                'thumbnail' => '/storage/uploads/fiddle-leaf-fig.jpg',
                'images' => json_encode(['/storage/uploads/fiddle-leaf-fig.jpg', '/storage/uploads/monstera-deliciosa.jpg', '/storage/uploads/calathea-orbifolia.jpg', '/storage/uploads/bird-of-paradise.jpg']),
                'stock' => 14,
                'average_rating' => 4.4,
                'reviews_count' => 60,
                'sold' => 3,
                'description' => 'Fiddle Leaf Fig is a trendy houseplant known for its large, violin-shaped leaves and can grow into a tall tree-like plant indoors.',
                'care_tips' => 'Bright, indirect light is ideal. Water when top 2-3 inches of soil are dry. Rotate plant regularly for even growth. Keep away from drafts.',
            ],
            [
                'name' => 'ZZ Plant',
                'scientific_name' => 'Zamioculcas zamiifolia',
                'category' => 'Air Purifying',
                'price' => 29.99,
                'thumbnail' => '/storage/uploads/zz-plant.jpg',
                'images' => json_encode(['/storage/uploads/zz-plant.jpg', '/storage/uploads/jade-plant.jpg', '/storage/uploads/snake-plant.jpg', '/storage/uploads/peace-lily.jpg']),
                'stock' => 50,
                'average_rating' => 4.6,
                'reviews_count' => 78,
                'sold' => 12,
                'description' => 'ZZ Plant is a tough, low-maintenance houseplant with glossy, dark green leaves. It thrives on neglect and tolerates low light conditions.',
                'care_tips' => 'Water sparingly - allow soil to dry completely between waterings. Low to bright indirect light. Avoid overwatering to prevent root rot.',
            ],
            [
                'name' => 'Pothos',
                'scientific_name' => 'Epipremnum aureum',
                'category' => 'Trailing',
                'price' => 14.99,
                'thumbnail' => '/storage/uploads/pothos.jpg',
                'images' => json_encode(['/storage/uploads/pothos.jpg', '/storage/uploads/aloe-vera.jpg', '/storage/uploads/string-of-pearls.jpg', '/storage/uploads/zz-plant.jpg']),
                'stock' => 100,
                'average_rating' => 4.7,
                'reviews_count' => 150,
                'sold' => 45,
                'description' => 'Pothos is one of the easiest houseplants to grow, featuring heart-shaped leaves that trail beautifully from hanging baskets.',
                'care_tips' => 'Tolerates low light but grows faster in bright indirect light. Water when top inch of soil is dry. Easy to propagate from cuttings.',
            ],
            [
                'name' => 'Calathea Orbifolia',
                'scientific_name' => 'Calathea orbifolia',
                'category' => 'Tropical',
                'price' => 32.99,
                'thumbnail' => '/storage/uploads/calathea-orbifolia.jpg',
                'images' => json_encode(['/storage/uploads/calathea-orbifolia.jpg', '/storage/uploads/monstera-deliciosa.jpg', '/storage/uploads/fiddle-leaf-fig.jpg', '/storage/uploads/peace-lily.jpg']),
                'stock' => 25,
                'average_rating' => 4.4,
                'reviews_count' => 55,
                'sold' => 8,
                'description' => 'Calathea Orbifolia is prized for its large, round leaves with striking silver-green stripes. A stunning statement plant for any room.',
                'care_tips' => 'High humidity is essential. Keep soil consistently moist but not waterlogged. Low to medium indirect light. Use distilled water to prevent leaf tip browning.',
            ],
            [
                'name' => 'String of Pearls',
                'scientific_name' => 'Senecio rowleyanus',
                'category' => 'Succulent',
                'price' => 19.99,
                'thumbnail' => '/storage/uploads/string-of-pearls.jpg',
                'images' => json_encode(['/storage/uploads/string-of-pearls.jpg', '/storage/uploads/jade-plant.jpg', '/storage/uploads/pothos.jpg', '/storage/uploads/aloe-vera.jpg']),
                'stock' => 35,
                'average_rating' => 4.5,
                'reviews_count' => 90,
                'sold' => 18,
                'description' => 'String of Pearls is a unique succulent with trailing stems covered in pea-like leaves. Perfect for hanging planters.',
                'care_tips' => 'Bright indirect light. Water when soil is completely dry and pearls start to pucker. Well-draining succulent mix is critical.',
            ],
            [
                'name' => 'Bird of Paradise',
                'scientific_name' => 'Strelitzia reginae',
                'category' => 'Tropical',
                'price' => 55.99,
                'thumbnail' => '/storage/uploads/bird-of-paradise.jpg',
                'images' => json_encode(['/storage/uploads/bird-of-paradise.jpg', '/storage/uploads/calathea-orbifolia.jpg', '/storage/uploads/fiddle-leaf-fig.jpg', '/storage/uploads/monstera-deliciosa.jpg']),
                'stock' => 15,
                'average_rating' => 4.8,
                'reviews_count' => 65,
                'sold' => 6,
                'description' => 'Bird of Paradise is a dramatic tropical plant with large banana-like leaves and iconic orange-blue flowers.',
                'care_tips' => 'Bright direct to indirect light. Water regularly during growing season, reduce in winter. High humidity. Fertilize monthly in spring and summer.',
            ],
        ];

        foreach ($plants as $plant) {
            \App\Models\Plant::updateOrCreate(
                ['name' => $plant['name']],
                $plant
            );
        }
    }
}
