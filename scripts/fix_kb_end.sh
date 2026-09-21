# Remove the old end
sed -i '$ d' src/pages/KnowledgeBasePage.tsx
sed -i '$ d' src/pages/KnowledgeBasePage.tsx
sed -i '$ d' src/pages/KnowledgeBasePage.tsx
sed -i '$ d' src/pages/KnowledgeBasePage.tsx
sed -i '$ d' src/pages/KnowledgeBasePage.tsx
sed -i '$ d' src/pages/KnowledgeBasePage.tsx
sed -i '$ d' src/pages/KnowledgeBasePage.tsx
sed -i '$ d' src/pages/KnowledgeBasePage.tsx

# Append the new end
cat << 'INNER_EOF' >> src/pages/KnowledgeBasePage.tsx
        )}
      </div>
      </div>
      </div>
    </div>
  );
};
INNER_EOF
