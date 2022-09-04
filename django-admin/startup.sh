python manage.py migrate
python manage.py collectstatic --noinput
python manage.py loaddata permissions.json
/usr/local/bin/gunicorn  -b 0.0.0.0:8000 -k gevent -w 4 djangoProject1.wsgi:application