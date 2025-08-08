def convert_student_to_dynamo_format(student_dict):
    """Convert Pydantic student model to DynamoDB format"""
    return {
        "student_id": {"S": student_dict["student_id"]},
        "display_name": {"S": student_dict["display_name"]},
        "primary_disability": {"S": student_dict["primary_disability"]},
        "accommodations_needed": {
            "L": [{"S": acc} for acc in student_dict["accommodations_needed"]]
        },
        "preferred_subjects": {
            "L": [{"S": subj} for subj in student_dict["preferred_subjects"]]
        },
        "learning_preferences": {
            "M": {
                "format": {"S": student_dict["learning_preferences"]["format"]},
                "modality": {"S": student_dict["learning_preferences"]["modality"]},
                "style": {"S": student_dict["learning_preferences"]["style"]}
            }
        },
        "availability": {
            "L": [
                {
                    "M": {
                        "day": {"S": avail["day"]},
                        "start_time": {"S": avail["start_time"]},
                        "end_time": {"S": avail["end_time"]}
                    }
                }
                for avail in student_dict["availability"]
            ]
        },
        "additional_info": {"S": student_dict.get("additional_info", "")}
    }