<?php

namespace App\Services;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FacialRecognitionService
{
    protected $apiKey;
    protected $apiSecret;
    protected $endpoint;
    
    
    public function __construct()
    {
         $this->apiKey = env('FACEPP_API_KEY');     // store in .env
        $this->apiSecret = env('FACEPP_API_SECRET'); // store in .env
        $this->endpoint = 'https://api-us.faceplusplus.com/facepp/v3/compare';
        
    }
    
   
    public function compareFaces(string $capturedImagePath, string $storedImagePath): bool
    {

        try {
            // Read the binary contents of the images from the 'public' disk
            $capturedImageContent = Storage::disk('public')->get($capturedImagePath);
            $storedImageContent = Storage::disk('public')->get($storedImagePath);

            // Check if files were read successfully
            if (!$capturedImageContent || !$storedImageContent) {
                Log::error('FacialRecognitionService: One or both image files not found in storage.', [
                    'captured_path' => $capturedImagePath,
                    'stored_path' => $storedImagePath
                ]);
                return false;
            }

            // Send the raw content to the API
            $response = Http::asMultipart()->post($this->endpoint, [
                'api_key' => $this->apiKey,
                'api_secret' => $this->apiSecret,
                'image_file1' => [
                    'name' => 'image_file1',
                    'contents' => $storedImageContent,
                    'filename' => basename($storedImagePath), // Provides a filename to the API
                ],
                'image_file2' => [
                    'name' => 'image_file2',
                    'contents' => $capturedImageContent,
                    'filename' => basename($capturedImagePath),
                ],
            ]);

            $data = $response->json();

            // Log the full response body for debugging
            Log::info('Face++ API Response: ' . $response->body());

            if (!$data || !isset($data['confidence'])) {
                Log::error('Face++ API error', ['response' => $response->body()]);
                return false;
            }

            // Confidence threshold (80% or higher = match)
            return $data['confidence'] >= 80;

        } catch (\Exception $e) {
            Log::error('Face++ API exception: ' . $e->getMessage());
            return false;
        }
    }
    
}
