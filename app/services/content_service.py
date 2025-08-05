import os

from fastapi import HTTPException

class ContentService:
    def read_section(self, section_id):
        file_name = 'content/' + str(section_id) + '.txt'

        if not os.path.exists(file_name):
            raise HTTPException(status_code=404, detail="Item not found")

        with open(file_name, 'r', encoding='utf-8') as file:
            content = file.read()
            return content