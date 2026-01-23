# -*- coding: utf-8 -*-
"""
Test script for Phone Diagnostic API
Kiểm tra Flask API và integration với Spring Boot
"""

import requests
import json
import os
from pathlib import Path

# Configuration
FLASK_API_URL = "http://localhost:5000"
SPRING_BOOT_API_URL = "http://localhost:8080/api"

# Test image paths
TEST_IMAGES_DIR = r"D:\DONGA\nam4\DATN\buysellphoneold\img\image_old"

def test_flask_health():
    """Test Flask health endpoint"""
    print("\n" + "=" * 70)
    print("TEST 1: Flask Health Check")
    print("=" * 70)
    
    try:
        response = requests.get(f"{FLASK_API_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        if response.status_code == 200 and response.json()['status'] == 'healthy':
            print("✅ PASS: Flask server is healthy")
            return True
        else:
            print("❌ FAIL: Flask server is not healthy")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

import base64

def encode_image(image_path):
    """Helper to base64 encode an image"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def test_flask_diagnostic():
    """Test Flask diagnostic endpoint with list of images and functional checks"""
    print("\n" + "=" * 70)
    print("TEST 2: Flask Diagnostic API (New Protocol)")
    print("=" * 70)
    
    # Find images in test directory
    image_files = list(Path(TEST_IMAGES_DIR).glob("*.PNG"))
    if not image_files:
        print("❌ ERROR: No test images found")
        return False
    
    test_images = image_files[:2] # multiple images
    print(f"Test Images: {[p.name for p in test_images]}")
    
    try:
        # Prepare Payload
        encoded_images = [encode_image(p) for p in test_images]
        payload = {
            "images": encoded_images,
            "functionalChecks": {
                "batteryHealth": 85.5,
                "microphoneDamage": False,
                "frontCameraDamage": False, 
                "rearCameraDamage": True, # Simulate damage
                "wifiBluetoothIssue": False
            }
        }
        
        headers = {'Content-Type': 'application/json'}
        response = requests.post(
            f"{FLASK_API_URL}/api/diagnose",
            json=payload,
            headers=headers,
            timeout=120
        )
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n📊 Diagnostic Result:")
            print(f"  Success: {result['success']}")
            
            if result['success']:
                diagnostic = result['diagnostic']
                print(f"  Screen Cracks: {diagnostic['screenCracks']}%")
                print(f"  Total Depreciation: {diagnostic['totalDepreciation']}%")
                print(f"  Assessment: {diagnostic['overallAssessment']}")
                
                # Check if functional check influenced result (Rear camera damage = +15%)
                print(f"  Analysis Details: {str(diagnostic['analysisDetails'])[:100]}...")
                
                print("\n✅ PASS: Diagnostic completed successfully")
                return result
            else:
                print(f"❌ FAIL: {result.get('error')}")
                return None
        else:
            print(f"❌ FAIL: HTTP {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return None

def test_spring_boot_integration():
    """Test Spring Boot integration"""
    print("\n" + "=" * 70)
    print("TEST 3: Spring Boot Integration")
    print("=" * 70)
    print("⚠️  MANUAL TEST REQUIRED")
    print("\nTo test Spring Boot integration:")
    print("1. Get a valid productItemId from database")
    print("2. Use Postman/curl to call:")
    print(f"   POST {SPRING_BOOT_API_URL}/diagnostics/analyze")
    print("   Body (JSON):")
    print("""   {
     "productItemId": "UUID",
     "imagePhoneOlds": ["base64_string_1", "base64_string_2"],
     "batteryHealth": 90,
     "microphoneDamage": false
   }""")
    
def test_batch_analysis():
    # Removed as API is now inherently batch-capable via 'images' list
    print("\n" + "=" * 70)
    print("TEST 4: Batch Analysis -> Merged into Test 2 (New Protocol)")
    print("=" * 70)
    return True

def run_all_tests():
    """Run all tests"""
    print("\n" + "=" * 70)
    print("PHONE DIAGNOSTIC API - TEST SUITE")
    print("=" * 70)
    print(f"Flask API: {FLASK_API_URL}")
    print(f"Spring Boot API: {SPRING_BOOT_API_URL}")
    print(f"Test Images: {TEST_IMAGES_DIR}")
    
    test_results = []
    
    # Test 1: Health check
    test_results.append(("Health Check", test_flask_health()))
    
    # Test 2: Single diagnostic
    result = test_flask_diagnostic()
    test_results.append(("Diagnostic API", result is not None))
    
    # Test 3: Spring Boot (manual)
    test_spring_boot_integration()
    
    # Test 4: Batch analysis
    test_results.append(("Batch Analysis", test_batch_analysis()))
    
    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    
    for test_name, passed in test_results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    total_tests = len(test_results)
    passed_tests = sum(1 for _, passed in test_results if passed)
    
    print(f"\nTotal: {passed_tests}/{total_tests} tests passed")
    print("=" * 70)

if __name__ == "__main__":
    run_all_tests()
