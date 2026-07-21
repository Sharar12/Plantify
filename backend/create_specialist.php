<?php

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

\App\Models\User::updateOrCreate(
    ['email' => 'p@gmail.com'],
    [
        'name' => 'Plant Specialist',
        'phone' => '1234567890',
        'password' => bcrypt('11111111'),
        'role' => 'specialist'
    ]
);

echo "Specialist user created successfully!\n";
