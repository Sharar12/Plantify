<?php

require 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Facade;

Facade::setFacadeApplication(require 'bootstrap/app.php');

$user = DB::table('users')->where('email', 'AA@gmail.com')->first();

if ($user) {
    echo 'Admin user created successfully!' . PHP_EOL;
    echo 'Email: ' . $user->email . PHP_EOL;
    echo 'Role: ' . $user->role . PHP_EOL;
} else {
    echo 'Admin user not found!' . PHP_EOL;
}
