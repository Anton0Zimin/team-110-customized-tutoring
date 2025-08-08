def match_student_to_tutor(student, tutors):
    """
    Find the best tutor match for a student based on accommodations, availability, and subjects.
    Returns list of tutors sorted by compatibility score (highest first).
    """
    scored_tutors = []
    
    for tutor in tutors:
        score = calculate_compatibility_score(student, tutor)
        if score > 0:  # Only include viable matches
            scored_tutors.append((tutor, score))
    
    # Sort by score descending
    return [tutor for tutor, score in sorted(scored_tutors, key=lambda x: x[1], reverse=True)]

def calculate_compatibility_score(student, tutor):
    """Calculate compatibility score between student and tutor"""
    score = 0
    
    # Handle both DynamoDB format and regular format
    def get_list_values(item, key):
        if isinstance(item.get(key), dict) and "L" in item[key]:
            return [s["S"] for s in item[key]["L"]]
        return item.get(key, [])
    
    def get_string_value(item, key):
        if isinstance(item.get(key), dict) and "S" in item[key]:
            return item[key]["S"]
        return item.get(key, "")
    
    # Subject match (required)
    student_subjects = get_list_values(student, "preferred_subjects")
    tutor_subjects = get_list_values(tutor, "subjects")
    if not any(subj in tutor_subjects for subj in student_subjects):
        return 0
    
    # Availability overlap (required)
    if not has_availability_overlap(student, tutor):
        return 0
    
    # Accommodation compatibility
    student_accommodations = get_list_values(student, "accommodations_needed")
    tutor_skills = get_list_values(tutor, "accommodation_skills")
    accommodation_matches = sum(1 for acc in student_accommodations if acc in tutor_skills)
    score += accommodation_matches * 10
    
    # Disability experience
    student_disability = get_string_value(student, "primary_disability")
    tutor_experience = get_list_values(tutor, "experience_with_disabilities")
    if student_disability in tutor_experience:
        score += 15
    
    # Learning format compatibility
    student_format = student.get("learning_preferences", {}).get("M", {}).get("format", {}).get("S", "")
    tutor_format = get_string_value(tutor, "preferred_format")
    if student_format == tutor_format:
        score += 5
    
    # Modality compatibility
    student_modality = student.get("learning_preferences", {}).get("M", {}).get("modality", {}).get("S", "")
    tutor_modalities = get_list_values(tutor, "supported_modalities")
    if student_modality in tutor_modalities or "Hybrid" in tutor_modalities:
        score += 5
    
    return score

def has_availability_overlap(student, tutor):
    """Check if student and tutor have overlapping availability"""
    # Handle both formats
    if isinstance(student.get("availability"), dict) and "L" in student["availability"]:
        student_slots = student["availability"]["L"]
    else:
        student_slots = student.get("availability", [])
    
    if isinstance(tutor.get("availability"), dict) and "L" in tutor["availability"]:
        tutor_slots = tutor["availability"]["L"]
    else:
        tutor_slots = tutor.get("availability", [])
    
    for s_slot in student_slots:
        if isinstance(s_slot, dict) and "M" in s_slot:
            s_day = s_slot["M"]["day"]["S"]
            s_start = s_slot["M"]["start_time"]["S"]
            s_end = s_slot["M"]["end_time"]["S"]
        else:
            s_day = s_slot.get("day", "")
            s_start = s_slot.get("start_time", "")
            s_end = s_slot.get("end_time", "")
        
        for t_slot in tutor_slots:
            if isinstance(t_slot, dict) and "M" in t_slot:
                t_day = t_slot["M"]["day"]["S"]
                t_start = t_slot["M"]["start_time"]["S"]
                t_end = t_slot["M"]["end_time"]["S"]
            else:
                t_day = t_slot.get("day", "")
                t_start = t_slot.get("start_time", "")
                t_end = t_slot.get("end_time", "")
            
            if s_day == t_day and times_overlap(s_start, s_end, t_start, t_end):
                return True
    return False

def times_overlap(start1, end1, start2, end2):
    """Check if two time ranges overlap"""
    return start1 < end2 and start2 < end1