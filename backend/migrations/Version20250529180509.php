<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250529180509 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE feed_entry CHANGE project_id project_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE feed_entry RENAME INDEX idx_fd772e45a76ed395 TO IDX_DEAECECCA76ED395');
        $this->addSql('ALTER TABLE feed_entry RENAME INDEX idx_fd772e45166d1f9c TO IDX_DEAECECC166D1F9C');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA79FEC00D7');
        $this->addSql('DROP INDEX IDX_378DFDA79FEC00D7 ON interaction');
        $this->addSql('ALTER TABLE interaction CHANGE user_update_id_id feed_entry_id_id INT NOT NULL');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7EFD08CB2 FOREIGN KEY (feed_entry_id_id) REFERENCES feed_entry (id)');
        $this->addSql('CREATE INDEX IDX_378DFDA7EFD08CB2 ON interaction (feed_entry_id_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7EFD08CB2');
        $this->addSql('DROP INDEX IDX_378DFDA7EFD08CB2 ON interaction');
        $this->addSql('ALTER TABLE interaction CHANGE feed_entry_id_id user_update_id_id INT NOT NULL');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA79FEC00D7 FOREIGN KEY (user_update_id_id) REFERENCES feed_entry (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_378DFDA79FEC00D7 ON interaction (user_update_id_id)');
        $this->addSql('ALTER TABLE feed_entry CHANGE project_id project_id INT NOT NULL');
        $this->addSql('ALTER TABLE feed_entry RENAME INDEX idx_deaececc166d1f9c TO IDX_FD772E45166D1F9C');
        $this->addSql('ALTER TABLE feed_entry RENAME INDEX idx_deaececca76ed395 TO IDX_FD772E45A76ED395');
    }
}
