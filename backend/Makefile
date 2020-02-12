ZIP = zip -r
PYS = $(wildcard *.py)
DIST = chess-lambda.zip


.PHONY: all upload clean


all: $(DIST) upload update clean


$(DIST): $(PYS)
	$(ZIP) $@ $^


clean:
	-rm $(DIST)


upload: $(DIST)
	aws --profile direvus s3 cp $< s3://direvus-cloudformation/


update: $(DIST)
	aws --profile direvus cloudformation deploy \
		--stack-name chess-backend \
		--template-file template.cfn.yaml \
		--capabilities CAPABILITY_NAMED_IAM CAPABILITY_IAM \
		--no-fail-on-empty-changeset

