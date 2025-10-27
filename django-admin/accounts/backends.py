import smtplib
import ssl
from typing import Optional

from django.core.mail.backends.smtp import EmailBackend as DjangoEmailBackend


class PatchedSMTPEmailBackend(DjangoEmailBackend):
    """
    SMTP Email backend compatible with Python 3.13+ where smtplib.SMTP.starttls
    no longer accepts keyfile/certfile keyword arguments.

    This backend mirrors Django's SMTP backend behavior but calls starttls
    with an SSLContext when available, falling back gracefully for older
    Python versions.
    """

    def _build_ssl_context(self) -> ssl.SSLContext:
        context = ssl.create_default_context()
        # If a client certificate/key is provided, attempt to load it.
        certfile: Optional[str] = getattr(self, "ssl_certfile", None)
        keyfile: Optional[str] = getattr(self, "ssl_keyfile", None)
        if certfile or keyfile:
            try:
                context.load_cert_chain(certfile=certfile, keyfile=keyfile)
            except Exception:
                # Silently ignore loading issues to match Django's lenient behavior
                # (Django would have previously just passed these through to smtplib)
                pass
        return context

    def open(self):
        if self.connection:
            return False

        try:
            if self.use_ssl:
                # SMTPS (implicit TLS)
                self.connection = smtplib.SMTP_SSL(
                    self.host,
                    self.port,
                    local_hostname=self.local_hostname,
                    timeout=self.timeout,
                    context=self._build_ssl_context(),
                )
            else:
                # Plain SMTP, optionally upgraded to TLS
                self.connection = smtplib.SMTP(
                    self.host,
                    self.port,
                    local_hostname=self.local_hostname,
                    timeout=self.timeout,
                )
                self.connection.ehlo()
                if self.use_tls:
                    context = self._build_ssl_context()
                    try:
                        # Python 3.13+ preferred signature
                        self.connection.starttls(context=context)
                    except TypeError:
                        # Older Python versions (pre-3.13) signature
                        self.connection.starttls(
                            keyfile=getattr(self, "ssl_keyfile", None),
                            certfile=getattr(self, "ssl_certfile", None),
                        )
                    self.connection.ehlo()

            if self.username and self.password:
                self.connection.login(self.username, self.password)
            return True
        except Exception:
            if self.connection is not None:
                try:
                    self.connection.quit()
                except Exception:
                    pass
                finally:
                    self.connection = None
            raise
