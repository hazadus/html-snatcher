# Сгенерировать сообщение коммита (см. https://github.com/hazadus/gh-commitmsg)
commitmsg:
    gh commitmsg --language russian --examples

# Посчитать строки кода в проекте и сохранить в файл
cloc:
    cloc --fullpath  --md . > cloc.md
