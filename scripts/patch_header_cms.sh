sed -i '/{\/\* Direct CMS Admin Access Button \*\/}/,/} )}/d' src/components/layout/Header.tsx
# also there is a `</button>` that needs to be matched.
