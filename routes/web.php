<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('navigation', \App\Http\Controllers\Core\NavigationItemController::class)->except(['create', 'edit', 'show']);
    Route::post('navigation/reorder', [\App\Http\Controllers\Core\NavigationItemController::class, 'reorder'])->name('navigation.reorder');
    Route::post('navigation/config', [\App\Http\Controllers\Core\NavigationItemController::class, 'updateConfig'])->name('navigation.updateConfig');

    Route::resource('roles-group', \App\Http\Controllers\Core\RolesGroupController::class)->except(['create', 'edit', 'show']);

    Route::resource('modules-list', \App\Http\Controllers\Core\ModulesListController::class)->except(['create', 'edit', 'show']);

    Route::resource('permissions', \App\Http\Controllers\Core\PermissionsController::class)->except(['create', 'edit', 'show']);
    Route::post('permissions/toggle-standard', [\App\Http\Controllers\Core\PermissionsController::class, 'toggleStandard'])->name('permissions.toggleStandard');
    Route::delete('permissions/delete-standard', [\App\Http\Controllers\Core\PermissionsController::class, 'deleteStandard'])->name('permissions.deleteStandard');
});

require __DIR__.'/auth.php';

Route::post('/locale', \App\Http\Controllers\LocaleController::class)->name('locale.update');
