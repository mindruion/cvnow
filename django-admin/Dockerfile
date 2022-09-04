# pull official base image
FROM python:3.9-slim

# install weasyprint deps: https://weasyprint.readthedocs.io/en/stable/install.html#debian-ubuntu
RUN apt-get update && apt-get install -y build-essential python3-dev python3-pip python3-setuptools python3-wheel python3-cffi libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info


WORKDIR /code

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip

# copy project
COPY requirements.txt /code/

RUN pip install psycopg2-binary
RUN pip install gunicorn
RUN pip install gevent
RUN pip install -r requirements.txt

COPY . /code/

CMD ["bash", "startup.sh"]
