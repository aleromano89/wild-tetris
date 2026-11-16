.PHONY: e2e clean-e2e-scores

# Test nel browser (Playwright). Richiede lo stack avviato.
# Prima e dopo (anche se falliscono) cancella i punteggi di test (nome "e2e-...").
e2e:
	$(MAKE) --no-print-directory clean-e2e-scores
	docker compose run --rm e2e; status=$$?; $(MAKE) --no-print-directory clean-e2e-scores; exit $$status

clean-e2e-scores:
	docker compose exec -T mariadb sh -c 'mariadb -u"$$MARIADB_USER" -p"$$MARIADB_PASSWORD" "$$MARIADB_DATABASE" -e "DELETE FROM scores WHERE player_name LIKE '"'"'e2e-%'"'"'"'
