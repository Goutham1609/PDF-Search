import pandas as pd
import re
import os
from difflib import SequenceMatcher
from sklearn.metrics.pairwise import cosine_similarity
from config import CSV_FILE_PATH, DOWNLOAD_DIR, COMPANY_SIMILARITY_THRESHOLD, EMBEDDING_BATCH_SIZE

class EnhancedCSVProcessor:
    def __init__(self):
        self.df = None
        self.company_embeddings = {}
        self.embedding_model = None

    def load_csv(self):
        self.df = pd.read_csv(CSV_FILE_PATH)
        self.df.columns = self.df.columns.str.strip()
        self.df['COMPANY'] = self.df['COMPANY'].astype(str).str.strip()
        self.df['FROM YEAR'] = self.df['FROM YEAR'].astype(str).str.strip()
        self.df['TO YEAR'] = self.df['TO YEAR'].astype(str).str.strip()
        return self.df

    def initialize_company_embeddings(self, embedding_model):
        self.embedding_model = embedding_model
        unique_companies = self.df['COMPANY'].unique()
        company_texts = [f"Company: {c}" for c in unique_companies]
        embeddings = self.embedding_model.encode(
            company_texts,
            batch_size=EMBEDDING_BATCH_SIZE,
            show_progress_bar=True,
            convert_to_numpy=True,
            normalize_embeddings=True
        )
        for company, emb in zip(unique_companies, embeddings):
            self.company_embeddings[company] = emb

    def find_best_matching_companies(self, query_company, top_k=5):
        query_embedding = self.embedding_model.encode([f"Company: {query_company}"], normalize_embeddings=True)
        matches = []
        for company, emb in self.company_embeddings.items():
            sim = cosine_similarity([query_embedding[0]], [emb])[0][0]
            if sim >= COMPANY_SIMILARITY_THRESHOLD:
                matches.append((company, sim))
        matches.sort(key=lambda x: x[1], reverse=True)
        return matches[:top_k]

    def get_pdf_metadata_for_companies(self, companies, year_filter=None):
        company_mask = self.df['COMPANY'].isin(companies)
        filtered_df = self.df[company_mask]
        if year_filter:
            year_mask = (filtered_df['FROM YEAR'] == year_filter) | (filtered_df['TO YEAR'] == year_filter)
            filtered_df = filtered_df[year_mask]

        pdf_metadata = {}
        for _, row in filtered_df.iterrows():
            company = row['COMPANY']
            from_year = row['FROM YEAR']
            to_year = row['TO YEAR']
            url = row['ATTACHMENT']
            filename = self.generate_filename(company, from_year, to_year)
            filepath = os.path.join(DOWNLOAD_DIR, filename)
            if os.path.exists(filepath):
                pdf_metadata[filename] = {
                    "company": company,
                    "from_year": from_year,
                    "to_year": to_year,
                    "url": url,
                    "filepath": filepath
                }
        return pdf_metadata

    def generate_filename(self, company, from_year, to_year):
        clean_company = re.sub(r'[^a-zA-Z0-9\s]', '', company)
        clean_company = re.sub(r'\s+', '_', clean_company.strip())
        return f"{clean_company}_{from_year}_{to_year}.pdf"

    def get_all_companies(self):
        return sorted(self.df['COMPANY'].unique().tolist())

    def get_years_for_company(self, company):
        company_data = self.df[self.df['COMPANY'] == company]
        years = set(company_data['FROM YEAR']).union(set(company_data['TO YEAR']))
        return sorted(list(years))
