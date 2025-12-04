FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=CoreRoot.settings

WORKDIR /app

RUN python -m pip install --upgrade pip

COPY . /app
COPY docker-entrypoint.sh /

RUN pip install -r requirements.txt
RUN chmod 755 /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
