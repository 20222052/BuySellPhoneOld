from flask import request, jsonify
from datetime import datetime
from app.services.ai_service import ai_service
from app.services.diagnostic_service import diagnostic_service
from app.utils.image_utils import decode_image

def health_check():
    """Health check endpoint"""
    status = ai_service.get_status()
    status['status'] = 'healthy'
    status['timestamp'] = datetime.now().isoformat()
    return jsonify(status)

def diagnose_phone():
    """Main diagnostic endpoint"""
    try:
        print("\n" + "=" * 70)
        print("NEW DIAGNOSTIC REQUEST (MVC)")
        print("=" * 70)
        
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400
            
        data = request.json
        images_data = data.get('images', [])
        functional_checks = data.get('functionalChecks', {})
        
        # Legacy support
        if not images_data and 'image' in data:
            images_data = [data['image']]
            
        if not images_data:
            return jsonify({'error': 'No images provided'}), 400
            
        print(f"[INFO] Processing {len(images_data)} images")
        
        # Decode images
        images = []
        for img_str in images_data:
            img = decode_image(img_str)
            if img:
                images.append(img)
            else:
                print("[WARN] An image failed to decode")
                
        if not images:
            return jsonify({'error': 'Failed to decode any images'}), 400
            
        # Process Diagnostic
        result = diagnostic_service.process_diagnostic(images, functional_checks)
        
        response = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'diagnostic': {
                # Map to entity structure
                'screenCracks': result['cosmetic_results']['screen_cracks'],
                'scratches': result['cosmetic_results']['scratches'],
                'edgeDings': result['cosmetic_results']['edge_dings'],
                'dents': result['cosmetic_results']['dents'],
                'displayFailure': result['cosmetic_results']['display_failure'],
                'deadPixels': result['cosmetic_results']['dead_pixels'],
                'displayLines': result['cosmetic_results']['display_lines'],
                
                'totalDepreciation': result['total_depreciation'],
                'overallAssessment': result['overall_assessment'],
                
                'analysisDetails': {
                    'note': f"Processed {result['image_count']} images."
                }
            }
        }
        
        print(f"[SUCCESS] Diagnosis Complete. Total Depreciation: {result['total_depreciation']}%")
        return jsonify(response), 200
        
    except Exception as e:
        print(f"[ERROR] Request failed: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

def convert_to_base64():
    """Helper endpoint to convert image file to base64 string"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        # Read file and encode
        import base64
        image_bytes = file.read()
        base64_str = base64.b64encode(image_bytes).decode('utf-8')
        
        return jsonify({
            'success': True,
            'filename': file.filename,
            'base64': base64_str,
            'usage': 'Copy the "base64" string into your diagnostic request.'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
