<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250724001613 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        #$this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7EFD08CB2');
        $this->addSql('CREATE TABLE post (id INT AUTO_INCREMENT NOT NULL, owner_id_id INT NOT NULL, created_at DATETIME NOT NULL, edited_at DATETIME NOT NULL, content LONGTEXT NOT NULL, title VARCHAR(255) DEFAULT NULL, INDEX IDX_5A8A6C8D8FDDAB70 (owner_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8D8FDDAB70 FOREIGN KEY (owner_id_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE feed_entry DROP FOREIGN KEY FK_DEAECECC166D1F9C');
        $this->addSql('ALTER TABLE feed_entry DROP FOREIGN KEY FK_DEAECECCA76ED395');
        $this->addSql('DROP TABLE feed_entry');
        $this->addSql('ALTER TABLE connection ADD notify_initiating_user TINYINT(1) DEFAULT NULL, ADD notify_connected_user TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7A76ED395');
        $this->addSql('DROP INDEX IDX_378DFDA7A76ED395 ON interaction');
        $this->addSql('DROP INDEX IDX_378DFDA7EFD08CB2 ON interaction');
        $this->addSql('ALTER TABLE interaction ADD post_id_id INT NOT NULL, ADD user_id_id INT NOT NULL, DROP feed_entry_id_id, DROP user_id');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7E85F12B8 FOREIGN KEY (post_id_id) REFERENCES post (id)');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA79D86650F FOREIGN KEY (user_id_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_378DFDA7E85F12B8 ON interaction (post_id_id)');
        $this->addSql('CREATE INDEX IDX_378DFDA79D86650F ON interaction (user_id_id)');
        $this->addSql('ALTER TABLE project CHANGE details details JSON DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA7E85F12B8');
        $this->addSql('CREATE TABLE feed_entry (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, project_id INT DEFAULT NULL, created_at DATETIME NOT NULL, edited_at DATETIME NOT NULL, details JSON NOT NULL, update_type VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, code BINARY(16) NOT NULL COMMENT \'(DC2Type:ulid)\', INDEX IDX_DEAECECC166D1F9C (project_id), INDEX IDX_DEAECECCA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE feed_entry ADD CONSTRAINT FK_DEAECECC166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE feed_entry ADD CONSTRAINT FK_DEAECECCA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8D8FDDAB70');
        $this->addSql('DROP TABLE post');
        $this->addSql('ALTER TABLE interaction DROP FOREIGN KEY FK_378DFDA79D86650F');
        $this->addSql('DROP INDEX IDX_378DFDA7E85F12B8 ON interaction');
        $this->addSql('DROP INDEX IDX_378DFDA79D86650F ON interaction');
        $this->addSql('ALTER TABLE interaction ADD feed_entry_id_id INT NOT NULL, ADD user_id INT NOT NULL, DROP post_id_id, DROP user_id_id');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE interaction ADD CONSTRAINT FK_378DFDA7EFD08CB2 FOREIGN KEY (feed_entry_id_id) REFERENCES feed_entry (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_378DFDA7A76ED395 ON interaction (user_id)');
        $this->addSql('CREATE INDEX IDX_378DFDA7EFD08CB2 ON interaction (feed_entry_id_id)');
        $this->addSql('ALTER TABLE project CHANGE details details JSON DEFAULT NULL');
        $this->addSql('ALTER TABLE connection DROP notify_initiating_user, DROP notify_connected_user');
    }
}
