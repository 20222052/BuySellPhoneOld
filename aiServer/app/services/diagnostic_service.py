from app.services.ai_service import ai_service

class DiagnosticService:
    
    SEVERITY_KEYWORDS = {
        'severe': {'broken': 90, 'cracked': 80, 'shattered': 95, 'damaged': 70, 'severe': 85, 'major': 75, 'heavy': 70},
        'moderate': {'scratched': 40, 'worn': 35, 'used': 30, 'minor': 25, 'light': 20, 'small': 15},
        'good': {'new': 0, 'perfect': 0, 'excellent': 5, 'good': 10, 'clean': 8, 'flawless': 0}
    }
    
    WEIGHTS = {
        'screen_cracks': 0.25, 'scratches': 0.15, 'edge_dings': 0.10,
        'dents': 0.10, 'display_failure': 0.20, 'dead_pixels': 0.10, 'display_lines': 0.10
    }

    def extract_severity_score(self, caption):
        """Extract severity score from caption text (0-100)"""
        caption_lower = caption.lower()
        
        # Check severe damage
        for keyword, score in self.SEVERITY_KEYWORDS['severe'].items():
            if keyword in caption_lower: return score
            
        # Check moderate damage,
        for keyword, score in self.SEVERITY_KEYWORDS['moderate'].items():
            if keyword in caption_lower: return score
            
        # Check good condition
        for keyword, score in self.SEVERITY_KEYWORDS['good'].items():
            if keyword in caption_lower: return score
            
        return 25 # Default moderate

    def analyze_single_image(self, image):
        """Analyze a single image for all defects"""
        results = {}
        
        # Define analysis steps
        steps = {
            'screen_cracks': "the screen condition shows",
            'scratches': "the surface scratches are",
            'edge_dings': "the edges show",
            'dents': "the body condition is",
            'display_failure': "the display shows",
            'dead_pixels': "the screen pixels are",
            'display_lines': "the screen quality is"
        }
        
        for key, prompt in steps.items():
            analysis = ai_service.analyze_image(image, prompt)
            score = self.extract_severity_score(analysis)
            results[key] = score
            results[key + '_analysis'] = analysis
            
        return results

    def calculate_functional_depreciation(self, functional_checks):
        """Calculate depreciation based on functional checks"""
        depreciation = 0.0
        
        # Battery Health (< 80% loses value)
        battery_health = float(functional_checks.get('batteryHealth', 100))
        if battery_health < 80:
            depreciation += (80 - battery_health) * 0.5
            
        # Functional Components
        damages = {
            'microphoneDamage': 5, 'frontCameraDamage': 10, 'rearCameraDamage': 15,
            'chargingPortDamage': 10, 'speakerDamage': 5, 'buttonDamage': 5,
            'wifiBluetoothIssue': 15
        }
        
        for key, value in damages.items():
            if functional_checks.get(key):
                depreciation += value
                
        return depreciation

    def generate_assessment(self, total_depreciation):
        """Generate text assessment based on total depreciation"""
        if total_depreciation >= 75:
            return "Poor - Nhiều hư hỏng nghiêm trọng (Chức năng/Ngoại hình). Giá trị thu cũ thấp."
        elif total_depreciation >= 50:
            return "Fair - Hư hỏng đáng kể. Cần sửa chữa nhiều."
        elif total_depreciation >= 25:
            return "Good - Tình trạng khá, có vài lỗi nhỏ hoặc pin chai."
        else:
            return "Excellent - Máy rất tốt, ít lỗi."

    def process_diagnostic(self, images, functional_checks):
        """
        Process comprehensive diagnostic
        Args:
            images: List of PIL Image objects
            functional_checks: Dict of functional checks
        """
        # 1. Analyze all images
        image_results = [self.analyze_single_image(img) for img in images]
        
        # 2. Aggregate Cosmetic Damage (Worst case)
        aggregated = {k: 0 for k in self.WEIGHTS.keys()}
        
        for res in image_results:
            for key in aggregated.keys():
                if res.get(key, 0) > aggregated[key]:
                    aggregated[key] = res.get(key, 0)
        
        # 3. Calculate Cosmetic Depreciation
        cosmetic_depr = sum(aggregated[k] * self.WEIGHTS[k] for k in self.WEIGHTS)
        
        # 4. Calculate Functional Depreciation
        functional_depr = self.calculate_functional_depreciation(functional_checks)
        
        # 5. Total
        total_depr = min(100.0, cosmetic_depr + functional_depr)
        assessment = self.generate_assessment(total_depr)
        
        return {
            'cosmetic_results': aggregated,
            'cosmetic_depreciation': round(cosmetic_depr, 2),
            'functional_depreciation': round(functional_depr, 2),
            'total_depreciation': round(total_depr, 2),
            'overall_assessment': assessment,
            'image_count': len(images)
        }

diagnostic_service = DiagnosticService()
