FROM openwa/wa-automate

USER owauser

COPY --chown=owauser:owauser ./package.json ./package.default.json

# Remove "type": "module" line from package.json using sed
RUN sed -i '/"type": "module"/d' package.json

RUN PKGS=$(awk '/"dependencies": \{/,/\}/' package.default.json \
    | grep -o '"[^"]*":' \
    | sed 's/"//g; s/://' \
    | paste -sd ' ' -) \
    && npm install $PKGS \
    && rm package.default.json

COPY --chown=owauser:owauser ./index.js index.js

RUN mkdir -p -m 700 /usr/src/app/sessions

RUN mkdir -p -m 700 /usr/src/app/chats

ENTRYPOINT ["/usr/bin/dumb-init", "--", "./start.sh", "index.js"]